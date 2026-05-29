import { NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, feedback } from "@/db/schema";
import { sql } from "drizzle-orm";
import { gemini, CHAT_MODEL } from "@/lib/gemini";

export async function GET() {
  try {
    const recentConvs = await db
      .select()
      .from(conversations)
      .orderBy(sql`created_at desc`)
      .limit(20);

    const allFeedback = await db.select().from(feedback);

    const conversationPreview = recentConvs
      .map((c) => {
        const msgs = c.messages as Array<{ role: string; content: string }>;
        const summary = msgs
          .slice(0, 3)
          .map((m) => `[${m.role}] ${m.content.slice(0, 200)}`)
          .join("\n");
        return `Conversation ${c.id} (${c.status}, rating: ${c.rating ?? "unrated"}):\n${summary}`;
      })
      .join("\n\n");

    const feedbackSummary = allFeedback
      .map((f) => `[${f.category}] ${f.message}${f.comment ? ` (${f.comment})` : ""}`)
      .join("\n");

    const convRatings = recentConvs.filter((c) => c.rating);
    const avgRating =
      convRatings.length > 0
        ? (convRatings.reduce((s, c) => s + (c.rating ?? 0), 0) / convRatings.length).toFixed(1)
        : null;

    const prompt = `You are a customer support analyst. Given the recent conversations, admin ratings, and user feedback below, identify:
1. Top 3 most common customer issues or questions
2. Sentiment trend (positive, neutral, negative)
3. Any urgent patterns that need attention
4. One actionable recommendation

Conversations:
${conversationPreview || "No conversations yet."}

User Feedback:
${feedbackSummary || "No feedback yet."}

Respond in JSON format with keys: commonIssues (array of strings), sentiment (string), urgentPatterns (array of strings), recommendation (string).`;

    const response = await gemini.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const raw = response.choices[0].message.content ?? "{}";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json({
      ...data,
      totalConversations: recentConvs.length,
      totalFeedback: allFeedback.length,
      avgRating,
    });
  } catch (error) {
    return NextResponse.json(
      {
        commonIssues: [],
        sentiment: "Could not analyze",
        urgentPatterns: [],
        recommendation: "Database or AI service unavailable.",
        totalConversations: 0,
        totalFeedback: 0,
        avgRating: null,
        error: String(error),
      },
      { status: 200 }
    );
  }
}
