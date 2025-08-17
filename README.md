# Full Stack AI Career Coach 🧑‍💻  
Built with **Next.js, Neon DB, TailwindCSS, Prisma, Inngest, and Shadcn UI**  

🔥 Tutorial: [Watch on YouTube](https://youtu.be/UbXpRv5ApKA)

![sensai](https://github.com/user-attachments/assets/eee79242-4056-4d19-b655-2873788979e1)

---

## 👥 Team
**Team SynapSpark** ✨  
Innovating at the intersection of **AI, Web Development, and Career Growth**.

---

## 🚀 Overview
The **AI Career Coach** is a full-stack application that leverages **Generative AI + modern web technologies** to provide:  
- Personalized **career advice**  
- AI-powered **skill recommendations**  
- **Interactive Q&A chatbot**  
- Seamless **authentication and onboarding**  
- Clean **UI/UX with Tailwind + Shadcn UI**  

---

## 📌 Features
✅ AI-powered Q&A Career Chatbot  
✅ Secure Authentication using Clerk  
✅ Postgres Database with Neon + Prisma ORM  
✅ Event-driven workflows using Inngest  
✅ Fully responsive UI built with TailwindCSS & Shadcn UI  
✅ Modern Next.js 14 App Router setup  

---

## ⚡ Tech Stack
- **Frontend:** [Next.js](https://nextjs.org/), [TailwindCSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)  
- **Backend:** [Node.js](https://nodejs.org/), [Inngest](https://www.inngest.com/)  
- **Database:** [Neon](https://neon.tech/) (Serverless Postgres) + [Prisma](https://www.prisma.io/)  
- **Authentication:** [Clerk](https://clerk.com/)  
- **AI:** Google **Gemini API**  

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <your-repo-folder>

###2. Install dependencies
```bash
npm install

###3. Create a .env file with the following variables:
```env
DATABASE_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=

###4. Run the development server
```bash
npm run dev