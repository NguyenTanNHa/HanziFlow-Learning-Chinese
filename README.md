<p align="center">
  <img src="public/logo.jpg" alt="HanziFlow Logo" width="400" />
</p>

# HanziFlow 🌊
### Personalized Mandarin Learning Platform with Spaced Repetition (SRS) & Gemini AI


[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2C3E50?style=flat-square&logo=prisma)](https://prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite)](https://sqlite.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-8E44AD?style=flat-square&logo=google)](https://ai.google.dev/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary_Commercial-red.svg?style=flat-square)](LICENSE)

> **⚠️ Commercial License** — This source code is sold under a Proprietary Commercial License.
> Redistribution, reselling, or public sharing of this source code is strictly prohibited.
> See [LICENSE](LICENSE) for full terms. For purchasing, contact: **nguyentannha.dev@gmail.com**

---

## 📖 Introduction

**HanziFlow** is a next-generation web application designed to accelerate the journey of Mandarin Chinese learners from foundational levels (HSK 1-2) up to advanced fluency (HSK 5-6). Traditional language apps often force users into repetitive, linear curricula. HanziFlow breaks this bottleneck by implementing a **Personalized Placement Test** that dynamically adapts the learning roadmap, auto-completing material the student already knows.

By combining an interactive **3D Spaced Repetition System (SRS)** for vocabulary acquisition, structured **Grammar Hubs**, multi-modal skill sandboxes (Listening, Reading, Speaking, and Writing), and an **AI Tutor powered by Gemini 2.5 Flash**, HanziFlow acts as an intelligent, round-the-clock language partner.

---

## ⚡ Key Features

| Feature | Description | Tech Stack / Details |
| :--- | :--- | :--- |
| **📋 Smart Placement Test** | A 10-question diagnostics test covering listening, reading, and grammar. Automatically determines recommended HSK level and auto-completes/unlocks previous stages. | SQLite Transactions / Prisma |
| **🔒 Dynamic HSK Roadmap** | Visual roadmap displaying 6 learning stages. Lessons above the student's current HSK target are locked visually (`opacity-55` with lock icons) and logically. | CSS / Lucide / Next.js Router |
| **🎴 3D Flashcards & SRS** | Interactive 3D flip card system using a Spaced Repetition Algorithm (SuperMemo-2 derivative) adjusting intervals and ease factors based on user self-evaluation. | CSS 3D Transforms / Prisma SRS |
| **🎙️ Speech & Speaking Sandbox** | Practice speaking for the HSKK exams. Features browser-native microphone recording with real-time feedback. Ready for Gemini audio analysis. | MediaRecorder API / Web Audio |
| **✍️ AI-Powered Writing Sandbox** | Write compositions against structured prompts. Integrates with the Gemini API to analyze spellings, grammatical errors, and output a polished rewritten version. | Gemini 2.5 Flash / JSON Mode |
| **💬 AI Assistant Chatbot** | Interactive real-time Mandarin chatting experience with Pinyin hints, Vietnamese translation, and reflective prompt suggestions. | Gemini 2.5 Flash / Event-driven UI |
| **🛠️ Admin CMS** | Dedicated admin area at `/admin` to import vocabulary lists, link lessons, review payment requests, and manage content. | Server-side role-based routing |

---

## 🏗️ Overall Architecture

HanziFlow is architected with a decoupled frontend-backend model integrated via Next.js App Router API endpoints. It follows clean system boundaries mapping UI state changes to backend triggers.

```mermaid
graph TD
    %% Client Layer
    subgraph Client [Client-Side UI]
        DashboardView[Daily Dashboard & Streak Tracker]
        RoadmapView[HSK Roadmap & Lesson Lock Controller]
        SRSCards[3D Flashcard SRS Engine]
        SpeakingBox[Speaking Recorder & Player]
        AI_ChatView[Interactive AI Assistant Chat]
    end

    %% API Controller Layer
    subgraph API [Next.js Route Controllers]
        AuthRoute[API Auth Me / Login / Register]
        RoadmapRoute[API Roadmap Level Resolver]
        PlacementRoute[API Placement Test Handler]
        AIAssistantRoute[API Gemini AI Assistant / Chat]
        AIEvalRoute[API Writing AI Evaluator]
        VocabRoute[API Vocabulary Review SRS]
    end

    %% External Services
    subgraph Services [External API Gateways]
        Gemini[Google Gemini 2.5 Flash Engine]
        Resend[Resend Mail Delivery Service]
    end

    %% Database Layer
    subgraph DB [Persistence Layer]
        PrismaORM[Prisma Client]
        SQLite[(dev.db - SQLite DB)]
        Supabase[(PostgreSQL - Optional Production)]
    end

    %% Connections
    DashboardView --> API
    RoadmapView --> RoadmapRoute
    SRSCards --> VocabRoute
    SpeakingBox --> API
    AI_ChatView --> AIAssistantRoute

    AuthRoute --> PrismaORM
    RoadmapRoute --> PrismaORM
    PlacementRoute --> PrismaORM
    AIAssistantRoute --> Gemini
    AIEvalRoute --> Gemini
    VocabRoute --> PrismaORM
    AuthRoute --> Resend

    PrismaORM --> SQLite
    PrismaORM -.-> Supabase
```

### Data Flow for User Progression & Smart Placement Test:
1. **User completes Placement Test** $\rightarrow$ submits answers to `/api/placement-test/submit`.
2. **Server-side analyzer** calculates recommended HSK level (e.g., HSK 3).
3. **Database Transaction** updates `hskLevel` in `UserProfile` and bulk inserts completions into `UserProgress` for all lessons in levels 1 and 2.
4. **Roadmap Refresh** updates local client states. Stages HSK 1 & 2 show completed checkboxes, HSK 3 lessons unlock, and HSK 4-6 lessons remain locked.

---

## ⚙️ Environment Configuration

HanziFlow uses environmental variables to handle API credentials, database connections, and authentication secrets. Create a `.env.local` file in your root directory:

```bash
# ==============================================================================
# HANZIELOW SERVER-SIDE CONFIGURATION
# ==============================================================================

# Database Connection (Prisma)
# By default, uses local SQLite database file.
DATABASE_URL="file:./dev.db"

# JWT Secret Key for Session Authentication Tokens
JWT_SECRET="your-super-secure-local-jwt-development-secret-key"

# Google Gemini API Key (Required for AI Chat & Writing Evaluations)
# Get a key at: https://aistudio.google.com/
GEMINI_API_KEY="AIzaSyDmVSA4nvkK7..."

# Resend API Key (Required for Email Verification codes)
# Get a key at: https://resend.com/
RESEND_API_KEY="re_boXKyNWC_2XCzs..."
```

---

## 📦 Folder Structure

The repository follows standard Next.js App Router architectural design principles with separated schema definitions, reusable shared components, and type-safe library helpers.

```yaml
HanziFlow/
├── prisma/                   # Prisma database configuration
│   ├── dev.db                # Local SQLite binary database file
│   ├── schema.prisma         # Prisma Schema models and relationships
│   └── seed.ts               # Core database seed script (Vocab, Grammar, Lessons)
├── public/                   # Static public assets (images, icons, vectors)
├── src/                      # Application source directory
│   ├── app/                  # Next.js App Router (Layouts & API endpoints)
│   │   ├── admin/            # Curriculum CMS & Transaction Verification UI
│   │   ├── ai-assistant/     # Interactive chatbot interface
│   │   ├── api/              # Backend API Route handlers
│   │   │   ├── auth/         # Login, logout, register, and email verification
│   │   │   ├── placement-test/# Placement test diagnostic evaluation
│   │   │   ├── roadmap/      # Roadmap lock state resolver
│   │   │   └── skills/       # AI Evaluate and skill submissions
│   │   ├── dashboard/        # Streak trackers, daily missions, and statistics
│   │   ├── roadmap/          # Unified lesson tree timeline view
│   │   ├── speaking/         # HSKK recording and pronunciation console
│   │   ├── globals.css       # Core design tokens, gradients, animations
│   │   └── page.tsx          # Marketing home landing page
│   ├── components/           # Reusable React components (Sidebar, mascot, charts)
│   └── lib/                  # Shared helper libraries
│       ├── auth.ts           # Token verification & session decoders
│       ├── db.ts             # Prisma Client instance provider
│       ├── mail.ts           # Resend email templates & transmission
│       └── rate-limit.ts     # In-memory IP/User API request rate limiter
├── package.json              # NPM package configurations and scripts
└── tsconfig.json             # TypeScript rules and compiler targets
```

---

## 🚀 Installation & Local Setup

Get HanziFlow running locally in less than 3 minutes.

### Prerequisites
- **Node.js** (v18.x or higher recommended)
- **NPM** (v10.x or higher)

### Step 1: Clone the repository & Install dependencies
```bash
git clone https://github.com/your-username/HanziFlow.git
cd HanziFlow
npm install
```

### Step 2: Set up Database & Seeds
This will create a local SQLite database file, generate the client bindings, and seed HSK vocabulary, grammar rules, lessons, and quiz questions.
```bash
npx prisma db push
npx prisma db seed
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Test Accounts

The seed script initializes two pre-configured accounts with mock data for instant verification of platform capabilities:

### 1. Student Account (Standard User)
- **Email**: `student@hanziflow.com`
- **Password**: `password123`
- **Permissions**: Access to the learning dashboard, roadmap unlocking, SRS review system, and speaking/writing evaluations.

### 2. Admin Account (Administrator)
- **Email**: `admin@hanziflow.com`
- **Password**: `password123`
- **Permissions**: Unlocks the `/admin` console to import terms, configure roadmap items, and review transactional logs.

---

## ☁️ Supabase Production Migration (PostgreSQL / Storage / Auth)

HanziFlow is engineered to migrate from local SQLite development into cloud production using Supabase with minimal overhead.

### 1. Migrate Database to Supabase PostgreSQL
Update your `prisma/schema.prisma` datasource:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```
Obtain connection strings from the Supabase Project Dashboard and set them in your environment:
```env
DATABASE_URL="postgres://postgres.[ref]:[pw]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres.[ref]:[pw]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```
Execute schemas and seeds to the remote database instance:
```bash
npx prisma db push
npx prisma db seed
```

### 2. Enable Supabase Cloud Storage (For Speaking Voice Recordings)
To store student audio recordings on the cloud:
1. Create a **Public bucket** in Supabase Storage named `speaking-recordings`.
2. Install SDK: `npm install @supabase/supabase-js`.
3. In `src/app/speaking/page.tsx`, update the save method to upload the `.webm` audio blob directly to Supabase Storage, and save the public URL to `SpeakingRecording` model.

### 3. Replace Session Handler with Supabase Auth
Replace the current cookies/JWT logic in `src/middleware.ts` and `src/lib/auth.ts` with the `@supabase/ssr` client to leverage enterprise-level OAuth and user authentication controls.

---

## 🗺️ Product Roadmap

Milestones and features tracked for subsequent releases:

### Phase 1: MVP Core Features (Completed)
- [x] Initial database models & relations.
- [x] Onboarding questionnaire & Daily Missions dashboard.
- [x] Smart Placement test evaluation.
- [x] 3D Flipping Flashcards with Spaced Repetition logic.
- [x] Skill sandboxes for Listening dictation and Reading glossary.
- [x] Gemini AI Integration for interactive Chinese chats.

### Phase 2: AI Enhancements (In Progress)
- [ ] **🎙️ Speech Pronunciation Analyzer**: Send user microphone audio recordings directly to Gemini 2.5 to evaluate pronunciation correctness, tone errors, and Chinese conversational accuracy.
- [ ] **📈 Weak-Vocabulary Targeting**: Automatically dynamically prioritize flashcards that user fails often, injecting them into the onboarding dashboard recommendation engine.

### Phase 3: Gamification & Engagement (Planned)
- [ ] **🏆 Competitive Leagues**: Create dynamic global and weekly leaderboards using HSK user cohorts (Bronze, Silver, Gold leagues) based on earned weekly XP points.
- [ ] **🎖️ Dynamic Badge System**: Auto-award badges for learning milestones (e.g., "7-Day Streak", "Vocabulary Ninja 100+ words").

---

## 🤝 Contribution Guidelines

We welcome contributions to HanziFlow! To contribute:

1. **Fork** the repository.
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`).
3. **Commit your changes** (`git commit -m 'feat: add support for HSK 4 flashcards'`).
4. **Push to the branch** (`git push origin feature/amazing-feature`).
5. **Create a Pull Request** to the `master` branch.

Please ensure your code builds cleanly with `npm run build` and passes formatting guidelines before opening a pull request.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more details.

---

*Developed with ❤️ for Chinese learners around the world.*
