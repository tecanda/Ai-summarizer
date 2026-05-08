"use client";

import { useState, useRef } from "react";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";

type Status = "idle" | "uploading" | "success" | "error";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleFile = (f: File) => {
    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(f.type)) {
      setErrorMsg("Only PDF or .txt files are supported.");
      setStatus("error");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrorMsg("File must be under 10MB.");
      setStatus("error");
      return;
    }
    setFile(f);
    setStatus("idle");
    setSummary("");
    setErrorMsg("");
    setMessages([]);
    setExtractedText("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStatus("uploading");
    setSummary("");
    setErrorMsg("");
    setMessages([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/summarize", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSummary(data.summary);
      setExtractedText(data.extractedText || "");
      setStatus("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || !extractedText) return;
    const userMsg = question.trim();
    setQuestion("");
    setAsking(true);
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg, context: extractedText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get answer");
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err: unknown) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: err instanceof Error ? err.message : "Something went wrong.",
      }]);
    } finally {
      setAsking(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const reset = () => {
    setFile(null);
    setSummary("");
    setStatus("idle");
    setErrorMsg("");
    setMessages([]);
    setExtractedText("");
    setQuestion("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4
                      bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b
                      border-zinc-200 dark:border-zinc-800">
        <span className="text-xl font-bold tracking-tight">📄 DocSummarizer</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserButton />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">AI Document Summarizer</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Upload a PDF or text file, get a summary, then ask questions about it.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all
            ${dragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
              : "border-zinc-300 dark:border-zinc-700 hover:border-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="text-4xl">{file ? "📎" : "☁️"}</div>
          {file ? (
            <div className="text-center">
              <p className="font-semibold text-blue-600 dark:text-blue-400">{file.name}</p>
              <p className="text-sm text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-medium">Drop a file here or click to browse</p>
              <p className="text-sm text-zinc-500 mt-1">PDF or TXT · Max 10MB</p>
            </div>
          )}
        </div>

        {/* Error */}
        {status === "error" && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!file || status === "uploading"}
            className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {status === "uploading" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Summarizing…
              </span>
            ) : "✨ Summarize"}
          </button>
          {(file || status !== "idle") && (
            <button
              onClick={reset}
              className="py-3 px-4 rounded-xl font-medium border border-zinc-300 dark:border-zinc-700
                         hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm"
            >
              Reset
            </button>
          )}
        </div>

        {/* Summary Output */}
        {status === "success" && summary && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <span className="font-semibold text-sm">📋 Summary</span>
              <button
                onClick={() => navigator.clipboard.writeText(summary)}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="p-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        )}

        {/* Chat Section */}
        {status === "success" && extractedText && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <span className="font-semibold text-sm">💬 Ask about this document</span>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-3 p-5 max-h-96 overflow-y-auto">
              {messages.length === 0 && (
                <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
                  Ask anything about the document — e.g. "What are the main arguments?" or "Explain section 2."
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap
                    ${msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {asking && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 p-4 border-t border-zinc-100 dark:border-zinc-800">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAsk()}
                placeholder="Ask a question about the document…"
                disabled={asking}
                className="flex-1 px-4 py-2 rounded-xl text-sm border border-zinc-300 dark:border-zinc-700
                           bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
                           placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                           disabled:opacity-50"
              />
              <button
                onClick={handleAsk}
                disabled={!question.trim() || asking}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}