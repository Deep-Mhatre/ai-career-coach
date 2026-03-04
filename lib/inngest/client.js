import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ai-career-coach", // Unique app ID
  name: "AI Career Coach App",
  credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});
