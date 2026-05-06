import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import pool from "@/lib/db";
import { searchEmbeddings } from "@/lib/qdrant";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Get embed token from header
    const embedToken = req.headers.get("x-embed-token");

    if (!embedToken) {
      return NextResponse.json({ error: "Missing embed token" }, { status: 401 });
    }

    // Hash the token and look it up
    const tokenHash = createHash("sha256").update(embedToken).digest("hex");

    const client = await pool.connect();
    try {
      // Validate embed token
      const tokenResult = await client.query(
        `SELECT tenant_id, domain_restriction FROM embed_tokens 
         WHERE token_hash = $1 AND is_active = TRUE AND expires_at > NOW()`,
        [tokenHash]
      );

      if (tokenResult.rows.length === 0) {
        return NextResponse.json({ error: "Invalid or expired embed token" }, { status: 401 });
      }

      const { tenant_id: tenantId, domain_restriction: domainRestriction } = tokenResult.rows[0];

      // Check domain restriction if set
      if (domainRestriction) {
        const referer = req.headers.get("referer") || req.headers.get("origin") || "";
        if (!referer.includes(domainRestriction)) {
          return NextResponse.json({ error: "Domain not authorized" }, { status: 403 });
        }
      }

      // Update last used
      await client.query(
        "UPDATE embed_tokens SET last_used_at = NOW() WHERE token_hash = $1",
        [tokenHash]
      );

      // Parse request
      const body = await req.json();
      const { message, session_id: sessionId } = body;

      if (!message) {
        return NextResponse.json({ error: "Missing message" }, { status: 400 });
      }

      // Generate embedding for query
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: message,
      });

      const queryEmbedding = embeddingResponse.data[0].embedding;

      // Search Qdrant
      const searchResults = await searchEmbeddings(tenantId, queryEmbedding, 5, 0.7);

      // Build context
      const context = searchResults
        .map((r, idx) => `[Source ${idx + 1}]: ${r.payload.content}`)
        .join("\n\n");

      // Get tenant settings for chatbot name
      const settingsResult = await client.query(
        "SELECT chatbot_name FROM tenant_settings WHERE tenant_id = $1",
        [tenantId]
      );
      const chatbotName = settingsResult.rows[0]?.chatbot_name || "Support Bot";

      // Build system prompt
      const systemPrompt = `You are ${chatbotName}, a helpful customer support chatbot. 
Use the following context to answer the user's question:

${context || "No context available. Politely inform the user that no documents have been uploaded yet."}

Be concise, helpful, and professional.`;

      // Call LLM
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_CHAT_MODEL || "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: false,
      });

      const assistantResponse = response.choices[0].message.content || "Sorry, I could not generate a response.";

      // Log the chat
      await client.query(
        `INSERT INTO chat_logs (tenant_id, user_identifier, session_id, messages, model_used)
         VALUES ($1, $2, $3, $4, $5)`,
        [tenantId, "widget-user", sessionId || null, JSON.stringify([{ role: "user", content: message }, { role: "assistant", content: assistantResponse }]), process.env.OPENAI_CHAT_MODEL || "gpt-4o"]
      );

      // Update metrics
      await client.query(
        `INSERT INTO metrics (tenant_id, date, total_chats, total_api_calls)
         VALUES ($1, CURRENT_DATE, 1, 1)
         ON CONFLICT (tenant_id, date)
         DO UPDATE SET total_chats = metrics.total_chats + 1, total_api_calls = metrics.total_api_calls + 1`,
        [tenantId]
      );

      return NextResponse.json({ response: assistantResponse });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Embed API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
