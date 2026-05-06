import OpenAI from 'openai';
import { searchEmbeddings } from '@/lib/qdrant';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });

  return response.data[0].embedding;
}

export async function processQuery(
  tenantId: string,
  query: string,
  conversationHistory: ChatMessage[] = [],
  tenantSettings?: {
    chatbot_name?: string;
    greeting_text?: string;
  }
): Promise<{ response: string; sources: Array<{ content: string; score: number }> }> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Search for relevant chunks in Qdrant
  const searchResults = await searchEmbeddings(tenantId, queryEmbedding, 5, 0.7);

  // Build context from search results
  const context = searchResults
    .map((result, i) => `[Source ${i + 1}]: ${result.payload.content}`)
    .join('\n\n');

  // Build system prompt
  const systemPrompt = `You are a helpful customer support chatbot${tenantSettings?.chatbot_name ? ` named ${tenantSettings.chatbot_name}` : ''}. 
  
${context ? `Use the following context to answer the user's question. If the context doesn't contain relevant information, say so.\n\nCONTEXT:\n${context}` : 'No context has been uploaded yet. Politely inform the user that no documents have been uploaded.'}

INSTRUCTIONS:
- Answer based on the provided context when available
- Be concise but thorough
- If you reference specific information, mention the source number
- Maintain a helpful and professional tone`;

  // Build messages array
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: query },
  ];

  // Call OpenAI
  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 1000,
    stream: false,
  });

  const assistantResponse =
    response.choices[0].message.content || 'Sorry, I could not generate a response.';

  // Log token usage
  const tokenUsage = response.usage?.total_tokens || 0;

  return {
    response: assistantResponse,
    sources: searchResults.map((r) => ({
      content: r.payload.content as string,
      score: r.score,
    })),
  };
}
