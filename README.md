# 🏅 Clean Quest — Anti-Doping Education & Athlete Safety Platform

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-Flash%20AI-8E75B2?logo=google&logoColor=white)](https://aistudio.google.com/)
[![WebAuthn](https://img.shields.io/badge/WebAuthn-Passkeys-0A85EA?logo=fido&logoColor=white)](https://webauthn.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

**Clean Quest** is a gamified sports integrity and anti-doping educational platform designed for athletes, coaches, and sports practitioners. It transforms complex anti-doping rules (WADA Prohibited List, TUE regulations, inadvertent doping prevention) into engaging learning pathways, interactive mini-games, and an AI-powered medicine & supplement scanner.

---

## ✨ Key Features

- **🧠 Interactive Learning & Quizzes:** Step-by-step modular learning paths on anti-doping fundamentals, testing protocols, therapeutic use exemptions (TUE), and supplement risks.
- **🎮 Mini-Games Arcade:** Fast-paced interactive games like *Clean or Banned*, where athletes test their substance classification knowledge against real-world scenarios.
- **🤖 Clean Quest AI (Gemini Flash):** Multimodal medicine label inspection and conversational anti-doping advisor. Athletes can upload photo labels or input ingredient lists to assess doping risk and receive official verification guidance.
- **🔑 Biometric Passkey / WebAuthn Login:** Passwordless authentication using device biometric sensors (TouchID, FaceID, Windows Hello) built on the FIDO2 / W3C WebAuthn standard.
- **🏆 Gamification & Progression:** XP rewards, dynamic levels, daily streaks, achievement badges, and global athlete leaderboards.
- **⚡ Real-time Cloud Sync:** Powered by Supabase with Row Level Security (RLS) for seamless cross-device profile and quiz progress synchronization.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, React Router v7 |
| **Build Tool & Bundler** | Vite 8 |
| **Styling** | Tailwind CSS v4, Custom Design Tokens |
| **Icons** | Lucide React |
| **Backend & Database** | Supabase (PostgreSQL, Supabase Auth, Row Level Security) |
| **AI Engine** | Google Gemini API (Gemini 3.5 Flash-Lite) |
| **Authentication & Security** | WebAuthn / FIDO2 via `@simplewebauthn` + Supabase Auth |
| **Deployment & Serverless** | Vercel (Edge & Node Serverless Functions) |

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/RohanCodes118/Anti-Doping.git
cd Anti-Doping
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (you can copy `.env.example`):

```bash
cp .env.example .env
```

Configure your API keys:

```env
# Supabase Configuration (from Supabase Dashboard -> Project Settings -> API)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key

# Google Gemini API Key (Strictly server-side; get from https://aistudio.google.com/)
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to explore Clean Quest!

---

## 🗄️ Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase Dashboard.
3. Run `supabase_setup.sql` to initialize database tables, policies, and functions.
4. (Optional) Run `seed_demo_accounts.sql` to populate sample athlete profiles and quiz records.

---

## ☁️ Deploying to Vercel

Clean Quest is fully configured for zero-config Vercel deployment:

### Option 1: Via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy
vercel
```

### Option 2: Via Vercel Web Dashboard

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your `Anti-Doping` GitHub repository.
4. Add the following **Environment Variables** in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
5. Click **Deploy**.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the local Vite development server with API middlewares |
| `npm run build` | Builds the optimized production bundle to `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs Oxlint for high-performance static analysis |

---

## 🔒 Security & Privacy

- `GEMINI_API_KEY` is maintained strictly server-side (Vercel Serverless Functions / Vite server middleware) and is never exposed to the client browser.
- Passkeys are cryptographically verified on the server side without transmitting or storing biometric data.
- Row-Level Security (RLS) ensures users can only access and modify their own athlete profile data.

---

## 👤 Author & Maintainer

- **Rohan** — [@RohanCodes118](https://github.com/RohanCodes118)
