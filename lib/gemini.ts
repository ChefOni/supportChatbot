import "dotenv/config";
import OpenAI from "openai";

export const gemini = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.GEMINI_BASE_URL,
});

export const CHAT_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
export const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL ?? "text-embedding-004";
