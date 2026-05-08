import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200/20 dark:bg-violet-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-2xl shadow-violet-500/30 mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
            Summarizer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Transform your documents into concise summaries with AI
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-lg h-10 text-sm",
                card: "shadow-none border-0 bg-transparent",
                headerTitle: "text-2xl font-bold text-slate-900 dark:text-slate-100",
                headerSubtitle: "text-slate-600 dark:text-slate-400",
                socialButtonsBlockButton:
                  "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg",
                formFieldInput:
                  "border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 rounded-lg focus:ring-violet-500 dark:focus:ring-violet-600",
                footerActionLink: "text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300",
                dividerLine: "bg-slate-200 dark:bg-slate-700",
                dividerText: "text-slate-600 dark:text-slate-400",
              },
            }}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-6 animate-in fade-in duration-700 delay-200">
          Secured by{" "}
          <a href="https://clerk.com" className="text-violet-600 dark:text-violet-400 hover:underline">
            Clerk
          </a>
        </p>
      </div>
    </div>
  );
}