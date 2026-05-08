import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { extractText } from "unpdf";

export const runtime = "nodejs";
export const maxDuration = 60;

async function summarizeWithGroq(text: string): Promise<string> {
  const prompt = `You are an expert summarizer. Read the following document and provide:
1. A concise summary (3-5 sentences)
2. Key takeaways (3-5 bullet points)
3. Main topics covered

Document:
"""
${text}
"""`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Groq request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
  }

  let extractedText = "";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === "application/pdf") {
      const uint8Array = new Uint8Array(buffer);
      const { text } = await extractText(uint8Array, { mergePages: true });
      extractedText = Array.isArray(text) ? text.join(" ") : text;

      if (!extractedText.trim() || extractedText.trim().length < 50) {
        return NextResponse.json(
          { error: "This PDF appears to be scanned or image-based. Please upload a PDF with selectable text." },
          { status: 400 }
        );
      }
    } else if (file.type === "text/plain") {
      extractedText = buffer.toString("utf-8").trim();
      if (!extractedText) {
        return NextResponse.json({ error: "Text file is empty." }, { status: 400 });
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or TXT file." },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("File parsing error:", err);
    return NextResponse.json({ error: "Failed to read file contents." }, { status: 500 });
  }

  try {
    const summary = await summarizeWithGroq(extractedText.slice(0, 50000));
    return NextResponse.json({ summary, extractedText: extractedText.slice(0, 50000) });
  } catch (err) {
    console.error("Groq error:", err);
    return NextResponse.json(
      { error: "Groq API error. Check your GROQ_API_KEY in .env.local." },
      { status: 500 }
    );
  }
}
