import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question, context } = await req.json();

  if (!question || !context) {
    return NextResponse.json({ error: "Missing question or document context" }, { status: 400 });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that answers questions about a document. 
Only use information from the document to answer. If the answer is not in the document, say so clearly.

Document content:
"""
${context.slice(0, 50000)}
"""`,
        },
        {
          role: "user",
          content: question,
        },
      ],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    return NextResponse.json({ error: err.error?.message || "Groq request failed" }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json({ answer: data.choices[0].message.content });
}
