# SupportChatbot Implementation Plan

## 1. Architecture Overview

Multi-tenant SaaS with shared Next.js app, isolated tenant data, Docker deployment:

- **Relational Data**: PostgreSQL (users, tenants, API keys, chat logs, metrics) + Row-Level Security (RLS)
- **Vector Data**: Qdrant (per-tenant collections, Docker-hosted)
- **Auth**: Clerk with multi-tenant org support, JWT `tenant_id` claims
- **Ingestion**: BullMQ background jobs for document processing/embeddings
- **Embeddable Widget**: Standalone JS bundle with scoped embed tokens (no raw API keys)

## 2. Tech Stack

| Component | Tooling |
|-----------|---------|
| Frontend/Backend | Next.js 14+ (App Router), TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Database | PostgreSQL + Qdrant |
| Auth | Clerk (multi-tenant org support) |
| Embeddings | OpenAI `text-embedding-3-small` (1536 dims) |
| LLM | OpenAI GPT-4o (configurable per tenant) |
| Containerization | Docker, docker-compose |
| Background Jobs | BullMQ |

## 3. Core Features

### A. Multi-Tenancy & Isolation

- **PostgreSQL**: All tables include `tenant_id`, RLS enforces `tenant_id = current_setting('app.current_tenant_id')`
- **Qdrant**: Per-tenant collections (`tenant_{id}_embeddings`) prevent cross-tenant vector leaks
- **API Keys**: Hashed at rest, tenant-scoped
- **Embed Tokens**: Short-lived, domain-restricted for widgets

### B. Dashboard

1. **API Key Management**: Create/revoke keys, view last used
2. **Document Upload**: PDF/TXT/MD, ingestion status tracking
3. **Chat Testing**: In-dashboard test interface
4. **Chat Logs**: Filterable query/response history
5. **Customization**: Widget colors, greeting, logo, live preview
6. **Deployment Toggle**: Triggers ingestion, generates embed script
7. **Metrics**: Token usage, chat volume, API call graphs

### C. Embeddable Widget

- Injected via the following script tag:
  ```html
  <script src="https://your-domain.com/embed.js" data-embed-token="xxx" data-custom-greeting="Hi!"></script>
  ```
- Matches dashboard customization, streams responses

### D. Pipelines

1. **Ingestion**: Upload → parse → chunk (10-15% overlap) → embed → upsert to Qdrant
2. **Chat**: Validate token → embed query → search tenant Qdrant → build prompt → call LLM → stream response → log
3. **Deployment**: Toggle triggers pending document ingestion, activates chatbot

## 4. Phased Steps

### Phase 1: Foundation (Week 1)

- Init Next.js + TypeScript + Tailwind + shadcn/ui
- `docker-compose.yml` with Next.js, PostgreSQL, Qdrant
- Integrate Clerk auth
- Create PostgreSQL tables: `tenants`, `users`, `api_keys`, `chat_logs`, `documents`, `tenant_settings`, `metrics`
- Enable RLS, add `tenant_id` to all tables

### Phase 2: Core Pipeline (Week 2-3)

- Document upload API (tenant-scoped)
- Qdrant client, auto-create per-tenant collections
- Chunking + OpenAI embedding logic
- BullMQ ingestion jobs
- Chatbot API with retrieval, LLM streaming

### Phase 3: Dashboard (Week 4-5)

- API key management UI
- Document upload UI + status tracking
- In-dashboard chat test
- Chat logs page
- Customization page + live preview
- Metrics page
- Deployment toggle + embed script generation

### Phase 4: Widget (Week 6)

- Standalone JS widget
- Embed script endpoint
- Widget injection testing

### Phase 5: Hardening (Week 7)

- Cross-tenant isolation testing (2 test tenants)
- Per-tenant rate limiting (Redis)
- API key encryption at rest (AES-256)
- Adversarial isolation tests

### Phase 6: Production Prep (Week 8)

- Production Dockerfiles
- Health checks
- Environment variable docs
- Deployment docs

## 5. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Cross-tenant leaks | Per-tenant Qdrant collections, RLS, mandatory `tenant_id` filters |
| Slow ingestion | BullMQ background jobs, chunked processing |
| API key exposure | Short-lived embed tokens, no client-side API keys |
| Qdrant performance | HNSW indexing, limit 5-8 retrieved chunks |

## 6. Next Steps

Adjust stack (e.g., open-source embeddings, auth provider) or prioritize features?
Learn from questions with no answers 
Log every question 
Allow support documents 
Analytics 
