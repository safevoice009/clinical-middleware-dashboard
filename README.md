# Clinical Middleware Dashboard

An autonomous, metadata-first **Healthcare AI Command Center** designed to bridge the gap between clinical diagnostic agents and operational hospital billing systems.

This proof-of-concept simulates intercepting unstructured clinical notes from LLM doctor agents (like `AgentClinic` and `MedAgentBench`), validating them against standard **ICD-10-CM registries**, and performing insurance contract audits using a connected **Supabase** backend.

---

## 🚀 Key Features

- **Ingest Clinical Intent**: Select different mock patients and inspect their raw, unstructured Electronic Health Records (EHR) notes.
- **Autonomous Middleware execution**: Run the simulated pipeline to parse EHR notes, predict primary clinical impressions, and map them to appropriate ICD-10 medical codes.
- **Payer Rule Compliance**: Simulates checking patient claims against regional payer exclusions (e.g. Aetna, Blue Cross, UnitedHealthcare) to ensure zero audit discrepancies.
- **Real-time Reasoning Terminal**: A sleek, dark-mode monospace console that streams steps with staggered delays to represent active multi-agent reasoning.
- **Database Telemetry Logging**: Automatically log execution records and final claims directly to a relational Postgres database via Supabase client hooks.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    A[Visitor lands on Vercel URL] --> B[Metadata Cards (left pane)]
    B --> C[Run Pipeline button]
    C --> D[Terminal Console (right pane)]
    D --> E[Simulated steps]
    E --> F[Success badge & download claim JSON]
```

### Data Pipeline Flow
1. **Clinical Input**: Unstructured text input is loaded from patient records (EHR).
2. **Clinical Reasoner**: `AgentClinic` & `MedAgentBench` models suspect diagnostic mappings.
3. **Operational Interceptor**: Translates suspected diagnosis to ICD-10-CM codes.
4. **Payer Compliance Engine**: Validates code combinations against payer policy criteria.
5. **Postgres Telemetry Logger**: Writes execution logs into Supabase `pipeline_logs` table.

---

## 🛠️ Tech Stack & Integration

- **Frontend Framework**: [Next.js (App Router)](https://nextjs.org/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Telemetry**: [Supabase](https://supabase.com/) (PostgreSQL Relational DB)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📦 Local Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/safevoice009/clinical-middleware-dashboard.git
   cd clinical-middleware-dashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

---

## 💾 Database Schema

The system uses two tables in Supabase:

### 1. `clinical_pipelines`
```sql
CREATE TABLE clinical_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    target_specialty TEXT NOT NULL,
    clinical_repo_source TEXT NOT NULL,
    icd10_validation_supported BOOLEAN DEFAULT TRUE,
    completion_estimate_mins INT DEFAULT 5,
    community_trust_score NUMERIC(3,1) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `pipeline_logs`
```sql
CREATE TABLE pipeline_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID REFERENCES clinical_pipelines(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    status TEXT NOT NULL,
    log_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

*Developed by safevoice009 as a Clinical Systems Architect showcase.*
