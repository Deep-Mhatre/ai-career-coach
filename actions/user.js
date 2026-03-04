"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";
import { triggerIndustryInsightsOnDemand } from "@/lib/inngest/trigger";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Check if industry exists first (outside transaction)
    let industryInsight = await db.industryInsight.findUnique({
      where: {
        industry: data.industry,
      },
    });

    // Generate AI insights BEFORE transaction if industry doesn't exist
    let insights = null;
    if (!industryInsight) {
      insights = await generateAIInsights(data.industry);
    }

    // Start a fast transaction for database operations only
    const result = await db.$transaction(
      async (tx) => {
        // Create industry insight if it doesn't exist
        if (!industryInsight && insights) {
          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000, // Should be plenty now since no AI calls inside
      }
    );

    // Trigger Inngest to generate industry insights asynchronously
    try {
      await triggerIndustryInsightsOnDemand(data.industry, userId);
    } catch (error) {
      console.warn("Failed to trigger Inngest insights generation:", error);
      // Don't throw - continue even if Inngest trigger fails
    }

    revalidatePath("/");
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true, email: true, name: true, imageUrl: true },
  });

  // If user not found, create a new user record (basic onboarding)
  if (!user) {
    const clerkUser = await auth();
    user = await db.user.create({
      data: {
        clerkUserId: userId,
        email: clerkUser?.user?.email || "",
        name: `${clerkUser?.user?.firstName || ""} ${clerkUser?.user?.lastName || ""}`.trim(),
        imageUrl: clerkUser?.user?.imageUrl || "",
      },
    });
  }

  try {
    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}