"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");


  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  // If user not found, create a new user record
  if (!user) {
    // Get Clerk user info (if available)
    // You may need to adjust this depending on your auth setup
    const clerkUser = await auth();
    user = await db.user.create({
      data: {
        clerkUserId: userId,
        email: clerkUser?.user?.email || "",
        name: `${clerkUser?.user?.firstName || ""} ${clerkUser?.user?.lastName || ""}`.trim(),
        imageUrl: clerkUser?.user?.imageUrl || "",
      }
    });
  }

  try {
    // Start a transaction to handle both operations
    const result = await db.$transaction(
      async (tx) => {
        // First check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry doesn't exist, create it with default values
        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);

          industryInsight = await db.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
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
        timeout: 10000, // default: 5000
      }
    );

    revalidatePath("/");
    return result.user;
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
  });

  // If user not found, try to find by email and update clerkUserId, or create new
  if (!user) {
    // Get Clerk user info (if available)
    const clerkUser = await auth();
    // Try to find user by email
    let existingUser = null;
    if (clerkUser?.user?.email) {
      existingUser = await db.user.findUnique({ where: { email: clerkUser.user.email } });
    }
    if (existingUser) {
      // Update clerkUserId for existing user
      user = await db.user.update({
        where: { email: clerkUser.user.email },
        data: { clerkUserId: userId },
      });
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          clerkUserId: userId,
          email: clerkUser?.user?.email || "",
          name: `${clerkUser?.user?.firstName || ""} ${clerkUser?.user?.lastName || ""}`.trim(),
          imageUrl: clerkUser?.user?.imageUrl || "",
        }
      });
    }
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}