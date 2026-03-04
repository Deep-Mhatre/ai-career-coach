import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
});

export const generateIndustryInsights = inngest.createFunction(
  { id: "generate-industry-insights", name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Run every Sunday at midnight
  async ({ event, step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          return await model.generateContent(p);
        },
        prompt
      );

      const text = res.response.candidates[0].content.parts[0].text || "";
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

      const insights = JSON.parse(cleanedText);

      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  }
);

/**
 * Function triggered when user selects an industry during onboarding
 * Generates AI insights for that specific industry
 */
export const generateIndustryInsightsOnDemand = inngest.createFunction(
  {
    id: "generate-industry-insights-on-demand",
    name: "Generate Industry Insights On Demand",
  },
  { event: "app/generate.industry.insights" },
  async ({ event, step }) => {
    const { industry, userId } = event.data;

    if (!industry) {
      throw new Error("Industry is required");
    }

    // Check if industry insights already exist
    const existingInsight = await step.run(
      "Check existing insights",
      async () => {
        return await db.industryInsight.findUnique({
          where: { industry },
        });
      }
    );

    // If insights exist and are recent (less than 7 days old), skip generation
    if (
      existingInsight &&
      existingInsight.lastUpdated &&
      Date.now() - existingInsight.lastUpdated.getTime() < 7 * 24 * 60 * 60 * 1000
    ) {
      return {
        success: true,
        cached: true,
        message: `Insights for ${industry} already up to date`,
      };
    }

    const prompt = `
      Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
      {
        "salaryRanges": [
          { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
        ],
        "growthRate": number,
        "demandLevel": "High" | "Medium" | "Low",
        "topSkills": ["skill1", "skill2"],
        "marketOutlook": "Positive" | "Neutral" | "Negative",
        "keyTrends": ["trend1", "trend2"],
        "recommendedSkills": ["skill1", "skill2"]
      }
      
      IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
      Include at least 5 common roles for salary ranges.
      Growth rate should be a percentage.
      Include at least 5 skills and trends.
    `;

    const res = await step.ai.wrap(
      "gemini",
      async (p) => {
        return await model.generateContent(p);
      },
      prompt
    );

    const text = res.response.candidates[0].content.parts[0].text || "";
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    const insights = JSON.parse(cleanedText);

    await step.run(`Create or update ${industry} insights`, async () => {
      await db.industryInsight.upsert({
        where: { industry },
        update: {
          ...insights,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        create: {
          industry,
          ...insights,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    });

    return {
      success: true,
      industry,
      message: `Successfully generated insights for ${industry}`,
    };
  }
);
