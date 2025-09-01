**📄 Document Analyzer**
<p align="center"> <img src="https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?logo=google&logoColor=white&style=for-the-badge" /> <img src="https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&style=for-the-badge" /> <img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4-red?style=for-the-badge" /> <img src="https://img.shields.io/github/stars/gsekharreddy/pdf-analyser?style=for-the-badge&color=yellow" /> <img src="https://img.shields.io/github/forks/gsekharreddy/pdf-analyser?style=for-the-badge&color=green" /> </p> <p align="center"> 🚀 **Instant Insights from Your Documents** — Upload ➝ Ask ➝ Get Answers </p>
**✨ Features**

Multi-Format Support: Analyze a wide range of document types:

📕 PDFs (.pdf)

📝 Microsoft Word (.docx)

📄 Plain Text (.txt)

🖼️ Images (.png, .jpg, .jpeg) with automatic OCR

Text Pasting: Quickly paste text for instant analysis.

AI-Powered Analysis: Uses the Google Gemini API for summarization, Q&A, and data extraction.

Interactive Chat: Ask follow-up questions to dive deeper into your document’s content.

Client-Side Processing: Privacy-first — files are processed in your browser before sending for analysis.

Dark Mode: Sleek, eye-friendly UI that respects your system preferences 🌙

Responsive Design: Mobile-first, clean UI powered by Tailwind CSS.

⚡** How It Works**

The app consists of two main parts:

**Frontend** (index.html)

Handles file uploads & text input

Uses pdf.js, mammoth.js, tesseract.js for text extraction

Manages the chat interface

**Backend** (/api/analyze.js)

A Vercel serverless function acting as a secure proxy to the Google Gemini API

Ensures your GEMINI_API_KEY stays safe 🔒

🛠️ Setup & Deployment

Deploy your own Document Analyzer in just a few minutes with Vercel.

✅ **Prerequisites**

> A Google AI Studio API Key
```bash
https://aistudio.google.com
```

> A Vercel account (Free/Hobby plan works)
```bash
https://vercel.com/
```
> Git installed locally

**🚀 Steps**

Step 1: Clone the Repository
```bash
git clone https://github.com/gsekharreddy/pdf-analyser.git 
cd pdf-analyser
```

Step 2: Deploy to Vercel

Push the cloned repo to your GitHub/GitLab/Bitbucket.

On Vercel Dashboard → Add New → Project → Import repo.

Add Environment Variable(.env) under project settings:

Name: GEMINI_API_KEY
Value: your-google-ai-studio-api-key

Make sure your .env looks like this:
```.env
GEMINI_API_KEY=your_api_key_here
```

Click Deploy 🎉 → Your personal Document Analyzer will be live!

🔧 Customization

Want to change the model? Easy!

Open /api/analyze.js

Find this line:

const modelName = 'gemini-1.5-flash-latest';


Replace with another supported model, e.g.:

const modelName = 'gemini-1.5-pro-latest';

**💻 Tech Stack**

Frontend: HTML, Tailwind CSS

Backend: Vercel Serverless Functions (Node.js)

AI: Google Gemini API

**Document Parsing:**

📕 pdf.js

📝 mammoth.js

🖼️ Tesseract.js

**🌟 Why Document Analyzer?**

✔️ Privacy-first (processes locally before sending)
✔️ Simple & Fast (no heavy backend)
✔️ Scalable (serverless, deploy anywhere)
