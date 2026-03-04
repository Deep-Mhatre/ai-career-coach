import { inngest } from "./client";

/**
 * Trigger the industry insights generation function
 * This runs the AI analysis for industry data
 */
export async function triggerIndustryInsightsGeneration() {
  try {
    const result = await inngest.send({
      name: "app/generate.industry.insights",
      data: {
        timestamp: new Date().toISOString(),
      },
    });
    console.log("Inngest trigger successful:", result);
    return result;
  } catch (error) {
    console.error("Failed to trigger Inngest function:", error);
    throw error;
  }
}

/**
 * Trigger an async job to generate industry insights for a specific industry
 */
export async function triggerIndustryInsightsOnDemand(industry, userId) {
  try {
    const result = await inngest.send({
      name: "app/generate.industry.insights",
      data: {
        industry,
        userId,
        timestamp: new Date().toISOString(),
      },
    });
    console.log(
      `Inngest trigger successful for industry: ${industry}`,
      result
    );
    return result;
  } catch (error) {
    console.error(
      `Failed to trigger Inngest function for industry ${industry}:`,
      error
    );
    throw error;
  }
}
