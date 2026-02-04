import { Resend } from "resend";
import twilio from "twilio";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "jadenjones35@gmail.com";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "+16472480856";

let twilioClient: twilio.Twilio | null = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

export interface RecommendationNotification {
  id: string;
  url: string;
  subjectName: string;
  note?: string;
}

/**
 * Send email notification for a new recommendation
 */
export async function sendRecommendationEmail(
  recommendation: RecommendationNotification
): Promise<void> {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email notification");
    return;
  }

  const subject = `New Recommendation: ${recommendation.id}`;
  const noteText = recommendation.note
    ? `\n\nNote from recommender:\n${recommendation.note}`
    : "";

  const emailBody = `
New resource recommendation received:

URL: ${recommendation.url}
Topic: ${recommendation.subjectName}${noteText}

To approve this recommendation, reply to this email with "add" in the body.

Recommendation ID: ${recommendation.id}
  `.trim();

  try {
    await resend.emails.send({
      from: "notifications@topicstostudy.com", // Update with your verified domain
      to: ADMIN_EMAIL,
      subject,
      text: emailBody,
      replyTo: ADMIN_EMAIL, // For reply tracking
      headers: {
        "X-Recommendation-ID": recommendation.id,
      },
    });
  } catch (error) {
    console.error("Failed to send email notification:", error);
    throw error;
  }
}

/**
 * Send SMS notification for a new recommendation
 */
export async function sendRecommendationSMS(
  recommendation: RecommendationNotification
): Promise<void> {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn("Twilio not configured, skipping SMS notification");
    return;
  }

  // Truncate URL if too long for SMS
  let urlDisplay = recommendation.url;
  if (urlDisplay.length > 40) {
    urlDisplay = urlDisplay.substring(0, 37) + "...";
  }

  const message = `New recommendation: ${urlDisplay} for ${recommendation.subjectName}. ID: ${recommendation.id}`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: ADMIN_PHONE,
    });
  } catch (error) {
    console.error("Failed to send SMS notification:", error);
    throw error;
  }
}

/**
 * Send both email and SMS notifications
 */
export async function sendRecommendationNotifications(
  recommendation: RecommendationNotification
): Promise<void> {
  await Promise.allSettled([
    sendRecommendationEmail(recommendation),
    sendRecommendationSMS(recommendation),
  ]);
}
