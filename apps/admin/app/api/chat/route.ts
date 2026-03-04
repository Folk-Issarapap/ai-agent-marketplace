import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "GROQ_API_KEY is not configured. Get a free key at https://console.groq.com",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system:
      "You are Platform Assistant — a helpful AI for platform administrators. Respond concisely in the user's language (Thai or English).",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
