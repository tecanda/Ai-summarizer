"use client";

import { useState, useRef } from "react";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";

type Status = "idle" | "uploading" | "success" | "error";

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  const [visible, setVisible] = useState(true);

  setTimeout(() => {
    setVisible(false);
    onClose();
  }, 3000);

  if (!visible) return null;

  return (
    <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 z-50
      ${type === "success" ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900" : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900"}`}>
      {type === "success" ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )}
      {message}
    </div>
  );
}

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/summarize", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSummary(data.summary);
      setStatus("success");
      setToast({ message: "Document summarized successfully!", type: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setErrorMsg(message);
      setStatus("error");
      setToast({ message, type: "error" });
    }
  };

  const reset = () => {
    setFile(null);
    setSummary("");
    setStatus("idle");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200/20 dark:bg-violet-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/20 dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
      </div>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-20 flex items-center justify-between px-6 h-16
                         border-b border-slate-200/50 dark:border-slate-800/50
                         bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/30 dark:shadow-violet-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Summarizer</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserButton />
        </div>
      </header>

      {/* Page */}
      <main className="pt-20 min-h-screen flex flex-col items-center justify-start px-4 py-20 relative z-10">
        <div className="w-full max-w-3xl flex flex-col gap-12">

          {/* Heading */}
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Smart Document <br /> Summarizer
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Upload any PDF or text document and get an AI-powered summary in seconds. Perfect for research, learning, and staying informed.
            </p>
          </div>

          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={`
              group relative flex flex-col items-center justify-center gap-4
              rounded-3xl border-2 border-dashed p-16 cursor-pointer
              transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 delay-100
              ${dragOver
                ? "border-violet-400 bg-violet-50/80 dark:bg-violet-950/40 scale-105 shadow-2xl shadow-violet-500/20"
                : file
                  ? "border-violet-300 dark:border-violet-700 bg-gradient-to-br from-violet-50/60 to-indigo-50/60 dark:from-violet-950/30 dark:to-indigo-950/30 shadow-lg shadow-violet-500/10"
                  : "border-slate-300 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
              }
            `}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {file ? (
              <>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/50 dark:to-indigo-900/50 flex items-center justify-center animate-in zoom-in">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-violet-700 dark:text-violet-300">{file.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Click to change file</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center group-hover:from-violet-100 group-hover:to-indigo-100 dark:group-hover:from-violet-900/50 dark:group-hover:to-indigo-900/50 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Drop your file here</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">PDF or TXT · Max 10 MB</p>
                </div>
              </>
            )}
          </div>

          {/* Error */}
          {status === "error" && (
            <div className="flex items-start gap-4 px-6 py-4 rounded-2xl bg-red-50/80 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 animate-in fade-in slide-in-from-top-2 duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 flex-none">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Error</p>
                <p className="text-sm mt-1">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-3 delay-200">
            <button
              onClick={handleSubmit}
              disabled={!file || status === "uploading"}
              className="flex-1 h-14 px-6 rounded-xl text-base font-bold text-white
                         bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 
                         active:from-violet-800 active:to-indigo-800 shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                         transition-all duration-150 flex items-center justify-center gap-3 group"
            >
              {status === "uploading" ? (
                <>
                  <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Summarizing…</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Summarize
                </>
              )}
            </button>
            {(file || status !== "idle") && (
              <button
                onClick={reset}
                className="h-14 px-6 rounded-xl text-base font-bold
                           text-slate-700 dark:text-slate-300
                           border-2 border-slate-300 dark:border-slate-600
                           hover:bg-slate-100 dark:hover:bg-slate-800/80
                           active:bg-slate-200 dark:active:bg-slate-700
                           transition-all duration-150"
              >
                Clear
              </button>
            )}
          </div>

          {/* Summary */}
          {status === "success" && summary && (
            <div className="rounded-3xl border-2 border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-2xl shadow-slate-200/40 dark:shadow-slate-900/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-5 duration-700 bg-white/80 dark:bg-slate-900/50">
              <div className="flex items-center justify-between px-8 py-5 border-b-2 border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">✨ AI Summary</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(summary);
                    setToast({ message: "Summary copied to clipboard!", type: "success" });
                  }}
                  className="text-sm font-bold text-slate-600 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
              <div className="p-8 text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-900/50 font-medium">
                {summary}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}