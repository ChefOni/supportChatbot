import { db } from "../db";
import { kbDocuments } from "../db/schema";
import { embed, cosineSimilarity } from "./embed";
import { gemini, CHAT_MODEL } from "./gemini";

export async function searchKB(query: string, topK = 3) {
  const queryEmbedding = await embed(query);
  const docs = await db.select().from(kbDocuments);

  const scored = docs
    .map((doc) => {
      if (!doc.embedding) return { doc, score: 0 };

      const docEmbedding: number[] = JSON.parse(doc.embedding);
      const score = cosineSimilarity(queryEmbedding, docEmbedding);
      return { doc, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

export async function generateResponse(
  message: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[]
) {
  const relevantDocs = await searchKB(message);
  const kbContext = relevantDocs
    .map(({ doc, score }) => `[${doc.title}] ${doc.content}`)
    .join("\n\n");

  const systemPrompt = `You are baki, an AI-powered support agent. You are helpful, friendly, and concise.

Use the following knowledge base to answer the customer's question. If the information isn't in the knowledge base, be honest and offer to escalate.

Knowledge Base:
${kbContext || "No relevant documents found. Use your general knowledge to help."}`;

  const response = await gemini.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ],
    temperature: 0.7,
    max_tokens: 512,
  });

  return response.choices[0].message.content ?? "I'm sorry, I couldn't generate a response.";
}
