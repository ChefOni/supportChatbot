# baki — AI-Powered Support Agent

An AI-powered support agent with a dashboard, chat widget, knowledge base RAG, and customer insights. Built with Next.js, Postgres + pgvector, and Gemini AI.

## Architecture

```
┌────────────┐     ┌──────────────┐     ┌──────────────┐
│  Landing   │     │   Dashboard  │     │  Chat Widget │
│  Page /    │     │  /dashboard  │     │  /demo, /    │
└─────┬──────┘     └──────┬───────┘     └──────┬───────┘
      │                   │                    │
      └───────────────────┼────────────────────┘
                          │
                    ┌─────▼──────┐
                    │  Next.js   │
                    │ App Router │
                    └─────┬──────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼─────┐  ┌──────▼──────┐  ┌────▼─────┐
    │  Gemini   │  │  Postgres   │  │  pgvector │
    │    AI     │  │  (Drizzle)  │  │  (embeds) │
    └───────────┘  └─────────────┘  └──────────┘
```

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Database | PostgreSQL 16 + pgvector |
| ORM | Drizzle ORM |
| AI | Gemini via OpenAI SDK |
| Auth | Cookie-based (Node crypto, no deps) |

## Setup

### Prerequisites

- Docker (for Postgres + pgvector)
- Node.js 20+
- Gemini API key ([get one free](https://aistudio.google.com/apikey))

### 1. Start the database

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cp .env .env.local
```

Edit `.env.local` and set your `GEMINI_API_KEY`.

### 3. Push the schema & seed data

```bash
npm run db:push
npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

### Login

Visit `/login` and sign in with the credentials from `.env` (default: `admin@baki.ai` / `admin123`).

### Chat Widget

The floating chat bubble appears on the landing page (`/`) and the demo page (`/demo`). Click to start a conversation. The agent uses RAG to answer from the knowledge base. After each response, rate it with 1-5 stars.

To embed the widget on any page, add this script tag:

```html
<script src="/widget.js" defer></script>
```

Customize colors and position from **Settings** in the dashboard.

### Dashboard

| Tab | What it shows |
|-----|---------------|
| Overview | Stats: conversations, ratings, KB count + recent activity |
| Conversations | Full list with status filters, message count, ratings |
| Knowledge Base | Add/edit/delete KB docs. Click "Re-embed all" after changes |
| Insights | AI-generated analysis of conversations + feedback |
| Settings | Widget styling + seed demo data button |

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/chat` | Send a message, get AI response (creates/continues conversation) |
| POST | `/api/feedback` | Submit rating (1-5) for a conversation |
| GET | `/api/kb` | List all KB documents |
| POST | `/api/kb` | Create a KB document |
| PATCH | `/api/kb/:id` | Update a KB document |
| DELETE | `/api/kb/:id` | Delete a KB document |
| POST | `/api/kb/embed` | Re-generate embeddings for all KB docs |
| GET | `/api/insights` | AI-analyzed conversation trends and recommendations |
| POST | `/api/seed` | Seed the database with sample data |
| POST | `/api/login` | Sign in (returns session cookie) |
| POST | `/api/logout` | Sign out (clears session cookie) |
| PATCH | `/api/conversations/status` | Update conversation status (resolve/escalate) |

## Project Structure

```
app/
  page.tsx              Landing page
  demo/page.tsx         Demo page with widget
  login/page.tsx        Login form
  dashboard/            Protected dashboard
    page.tsx            Overview stats
    sidebar.tsx         Navigation
    conversations/      List + detail
    knowledge-base/     KB management
    insights/           AI analysis
    settings/           Widget config + seed
  api/                  API routes
    chat/               Chat endpoint
    feedback/           Rating endpoint
    kb/                 KB CRUD
    insights/           AI trends
    seed/               Data seeder
    login/logout/       Auth
    conversations/      Status updates
components/
  ChatWidget.tsx        React chat widget
db/
  schema.ts             Drizzle ORM schema
  index.ts              DB connection
  seed.ts               CLI seed script
lib/
  gemini.ts             OpenAI SDK → Gemini
  embed.ts              Embedding + similarity
  rag.ts                RAG pipeline
  auth.ts               Cookie auth helpers
public/
  widget.js             Vanilla JS embed snippet
```

## Demo Data

The seed script creates:
- 5 knowledge base documents (shipping, returns, account, payments, technical)
- 5 sample conversations with messages (mix of resolved, active, escalated)
- Feedback ratings for each conversation

Run it via CLI: `npm run db:seed`  
Or from the dashboard: **Settings → Seed Demo Data**
