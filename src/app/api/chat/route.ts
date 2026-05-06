import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/services/apiKeyService";
import { processQuery } from "@/services/chatService";
import pool from "@/lib/db";
import { withTenantContext } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Get API key from header
    const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 });
    }

    // Validate API key
    const keyData = await validateApiKey(apiKey);
    if (!keyData) {
      return NextResponse.json({ error: "Invalid or expired API key" }, { status: 401 });
    }

    const { tenantId } = keyData;

    // Parse request body
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
    if (!lastUserMessage) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 });
    }

    // Get tenant settings
    const settings = await withTenantContext<any>(tenantId, async (client) => {
      const result = await client.query("SELECT * FROM tenant_settings WHERE tenant_id = $1", [tenantId]);
      return result.rows[0];
    });

    // Process the query
    const { response, sources } = await processQuery(
      tenantId,
      lastUserMessage.content,
      messages.slice(0, -1), // Exclude the last message from history
      settings
    );

    // Log the chat
    await withTenantContext(tenantId, async (client) => {
      await client.query(
        `INSERT INTO chat_logs (tenant_id, messages, model_used)
         VALUES ($1, $2, $3)`,
        [tenantId, JSON.stringify(messages), process.env.OPENAI_CHAT_MODEL || "gpt-4o"]
      );
    });

    // Update metrics
    await withTenantContext(tenantId, async (client) => {
      await client.query(
        `INSERT INTO metrics (tenant_id, date, total_chats, total_api_calls)
         VALUES ($1, CURRENT_DATE, 1, 1)
         ON CONFLICT (tenant_id, date)
         DO UPDATE SET total_chats = metrics.total_chats + 1, total_api_calls = metrics.total_api_calls + 1`,
        [tenantId]
      );
    });

    return NextResponse.json({ response, sources });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
