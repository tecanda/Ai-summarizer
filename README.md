# AI Document Summarizer

An AI-powered web app that summarizes PDF and text documents and lets you ask questions about them. Built with Next.js, Clerk, Tailwind CSS, and Groq (LLaMA 3.3).

## Features

- Email/password authentication via Clerk
- Upload PDF or TXT files (up to 10MB)
- AI-generated summary with key takeaways
- Ask follow-up questions about the document
- Dark/light mode toggle

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Auth:** Clerk
- **AI:** Groq API (LLaMA 3.3 70B)
- **Styling:** Tailwind CSS
- **PDF Parsing:** unpdf

## Getting Started

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/your-username/my-summarizer-app.git
cd my-summarizer-app
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables

Copy the example env file and fill in your API keys:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Then open `.env.local` and replace the placeholder values:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [clerk.com](https://clerk.com) → Your app → API Keys |
| `CLERK_SECRET_KEY` | [clerk.com](https://clerk.com) → Your app → API Keys |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |

### 4. Run the development server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```text
app/
├── (auth)/
│   ├── sign-in/     # หน้า Login ของ Clerk
│   └── sign-up/     # หน้า Register ของ Clerk
├── api/
│   ├── summarize/   # API สำหรับสกัดข้อความและสรุปผล
│   └── chat/        # API สำหรับถาม-ตอบข้อมูลจากเอกสาร
├── dashboard/       # หน้าหลักสำหรับอัปโหลด สรุป และแชท
├── layout.tsx       # Root Layout พร้อม ClerkProvider และ Theme Script
└── page.tsx         # หน้าแรกสำหรับจัดการการ Redirect ผู้ใช้
components/
└── ThemeToggle.tsx  # ปุ่มสลับโหมด มืด/สว่าง
---
