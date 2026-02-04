import { NextRequest, NextResponse } from "next/server";
import { readJsonFromGitHub, writeJsonToGitHub } from "@/lib/github";

interface Recommendation {
  id: string;
  url: string;
  subjectId: number;
  subjectName: string;
  note?: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

/**
 * Handle email replies from Resend or other email services
 * This endpoint should be configured as a webhook in your email service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract email content - format depends on email service
    // For Resend inbound emails:
    const emailBody = body.text || body.html || "";
    const emailSubject = body.subject || "";
    const fromEmail = body.from || "";

    // Only process emails from admin email
    const adminEmail = process.env.ADMIN_EMAIL || "jadenjones35@gmail.com";
    if (!fromEmail.includes(adminEmail)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look for "add" command in email body (case-insensitive)
    const bodyLower = emailBody.toLowerCase();
    if (!bodyLower.includes("add")) {
      return NextResponse.json({ message: "No 'add' command found" }, { status: 200 });
    }

    // Extract recommendation ID from subject or body
    // Subject format: "New Recommendation: {id}"
    let recommendationId: string | null = null;

    // Try to extract from subject
    const subjectMatch = emailSubject.match(/New Recommendation:\s*([a-f0-9-]+)/i);
    if (subjectMatch) {
      recommendationId = subjectMatch[1];
    } else {
      // Try to extract from body
      const bodyMatch = emailBody.match(/Recommendation ID:\s*([a-f0-9-]+)/i);
      if (bodyMatch) {
        recommendationId = bodyMatch[1];
      }
    }

    if (!recommendationId) {
      return NextResponse.json(
        { error: "Could not find recommendation ID" },
        { status: 400 }
      );
    }

    // Read recommendations
    const recommendations = await readJsonFromGitHub<{
      pending: Recommendation[];
      approved: Recommendation[];
      rejected: Recommendation[];
    }>("data/recommendations.json");

    // Find the recommendation
    const recommendation = recommendations.pending?.find((r) => r.id === recommendationId);

    if (!recommendation) {
      return NextResponse.json(
        { error: "Recommendation not found or already processed" },
        { status: 404 }
      );
    }

    // Approve the recommendation
    // Move from pending to approved
    const updatedRecommendations = {
      pending: recommendations.pending.filter((r) => r.id !== recommendationId),
      approved: [...(recommendations.approved || []), { ...recommendation, status: "approved" as const }],
      rejected: recommendations.rejected || [],
    };

    // Read resources
    const resources = await readJsonFromGitHub<Record<string, Array<{ url: string; addedAt: string }>>>(
      "data/resources.json"
    );

    // Add to resources
    const subjectKey = recommendation.subjectId.toString();
    if (!resources[subjectKey]) {
      resources[subjectKey] = [];
    }

    // Check if already exists
    if (!resources[subjectKey].some((r) => r.url === recommendation.url)) {
      resources[subjectKey].push({
        url: recommendation.url,
        addedAt: new Date().toISOString(),
      });

      // Save resources
      await writeJsonToGitHub(
        "data/resources.json",
        resources,
        `Approve recommendation: ${recommendation.url} for ${recommendation.subjectName}`
      );
    }

    // Save updated recommendations
    await writeJsonToGitHub(
      "data/recommendations.json",
      updatedRecommendations,
      `Approve recommendation via email: ${recommendation.url}`
    );

    return NextResponse.json({
      success: true,
      message: `Recommendation ${recommendationId} approved and added to resources`,
    });
  } catch (error: any) {
    console.error("Error processing email webhook:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process email webhook" },
      { status: 500 }
    );
  }
}
