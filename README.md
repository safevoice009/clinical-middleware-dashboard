<div align="center">
  <img src="public/banner.png" alt="Clinical Systems Middleware Banner" width="100%" style="border-radius: 16px; margin-bottom: 24px;">

  # 🏥 Clinical Systems Architecture // EHR Operational Middleware

  [![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)](https://clinical-middleware-dashboard.vercel.app)
  [![Supabase Postgres](https://img.shields.io/badge/Supabase-Database-151515?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com)
  [![GitHub Action Scraper](https://img.shields.io/badge/GitHub_Actions-Automation-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/safevoice009/clinical-middleware-dashboard/actions)
  [![Clinical Architecture](https://img.shields.io/badge/Framework-Next.js_16-blue?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
  [![Physician-Led](https://img.shields.io/badge/Physician--Led-Dr.%20Baddam%20Sucharith%20Reddy-8E7C68?style=for-the-badge&logo=gitbook&logoColor=white)](https://www.linkedin.com/in/sucharith007)

  <p align="center">
    An autonomous, metadata-first <strong>Clinical-to-Billing Intercept Middleware Playground</strong> designed to bridge the structural gap between advanced medical AI reasoning agents and legacy healthcare revenue cycles.
  </p>
  
  ---
  
  <h3>📺 Deployed Cockpit Walkthrough & Product Demo</h3>
  
  <p align="center">
    Watch the 2-minute clinical workflow execution, code transpilation, and live telemetry audit stream:
  </p>

  <video src="product_demo_video.mp4" width="100%" controls autoplay loop muted style="border-radius: 12px; border: 1px solid #eae6df; box-shadow: 0 10px 30px rgba(0,0,0,0.05);"></video>
</div>

---

> [!TIP]
> ### 🚀 Core Engine Features
>
> | Feature Area | Description & Mechanisms |
> | :--- | :--- |
> | **📥 1. EHR Intake Ingestion** | Captures raw clinical notes from Electronic Health Records (EHR) and patient profiles. Standardizes inputs for downstream differential AI models. |
> | **🧠 2. LLM Clinical Reasoning** | Integrates diagnostic models (inspired by **AgentClinic**) to extract differential impression confidence scores (Circular SVG dials). |
> | **⚙️ 3. ICD-10 & CPT Transpiler** | Autonomous mapping of symptoms and clinical impressions to validated, standard billing code registries (ICD-10-CM / CPT). |
> | **🛡️ 4. Insurance Payer Auditing** | Real-time checks on policy eligibility guidelines, provider NPI credentials, and pre-authorization exclusions (Aetna/BCBS/UHC). |

---

## 🗺️ System Engineering Data Flow

The diagram below details how unstructured Electronic Health Record (EHR) narratives are parsed, validated, and converted into compliant, audited insurance claim envelopes:

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#F5F2EB',
    'primaryTextColor': '#4A3F35',
    'primaryBorderColor': '#D0C8B8',
    'lineColor': '#8E7C68',
    'secondaryColor': '#EAD5C3',
    'tertiaryColor': '#FDFCF7',
    'actorBkg': '#FDFCF7',
    'actorBorder': '#8E7C68',
    'actorTextColor': '#4A3F35',
    'signalColor': '#8E7C68',
    'signalTextColor': '#4A3F35',
    'labelBoxBorderColor': '#D0C8B8',
    'labelBoxBkgColor': '#FDFCF7',
    'labelTextColor': '#4A3F35',
    'loopLimitWidth': 10
  }
}}%%
sequenceDiagram
    autonumber
    actor User as Visitor (Playground Cockpit)
    participant EHR as 1. EHR Intake Ingestion
    participant AI as 2. AgentClinic Diagnostics
    participant Code as 3. ICD-10/CPT Transpiler
    participant Payer as 4. Revenue Underwriter
    participant DB as Supabase PostgreSQL

    User->>EHR: Select Profile & Edit Clinical Note
    User->>EHR: Trigger simulated intake run
    EHR->>AI: Fetch clinical narrative packet
    activate AI
    AI-->>AI: Extract symptoms & run differential diagnoses
    AI->>Code: Stream suspected impression (94.2% Conf.)
    deactivate AI
    activate Code
    Code-->>Code: Resolve diagnoses to ICD-10-CM codes
    Code-->>Code: Map procedures to CPT codes
    Code->>Payer: Ship transpiled billing claim envelope
    deactivate Code
    activate Payer
    Payer-->>Payer: Run policy checks (Aetna / BCBS / UHC)
    Payer-->>Payer: Verify provider NPI & pre-auth exclusions
    Payer->>DB: Telemetry POST: Log clinical execution log
    Payer-->>User: Drop logs drawer & scroll-focus on Step 4 claim output
    deactivate Payer
```

---

> [!NOTE]
> ### 🎨 Bento Cockpit Play Sandbox
> The deployed web application provides a responsive, sand-toned play sandbox where you can interactively trace each middleware step:
> * 📝 **Edit Narrative Notes**: Under **Step 1**, modify the patient's symptoms or narrative and re-verify how it updates outputs.
> * 📊 **Inspect Confidence Gauges**: Under **Step 2**, view diagnostic outcomes and watch the circular SVG confidence dial animate.
> * 🏷️ **Hover Billing Tooltips**: Under **Step 3**, hover over CPT/ICD code badges to view detailed procedural explanations.
> * 📑 **Underwrite Claims**: Under **Step 4**, review pre-auth checklists and export/copy compiled claim JSON structures.
> * 💻 **Read Developer Telemetry Logs**: Expand or auto-collapse the bottom logs drawer featuring colored, macOS-styled console streams.

---

## 🛠️ The Tech Stack

| Layer | Technologies & Frameworks |
| :--- | :--- |
| **Frontend Core** | [![Next.js](https://img.shields.io/badge/Next.js-15.2.6-black?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) |
| **Styling & Aesthetics** | [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) <br> *Featuring typography from **Lora** (Editorial Serif) & **Outfit** (Sans-Serif) Google Fonts.* |
| **Database & Telemetry** | [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/) *PostgreSQL Relational Storage* |
| **Deployment** | [![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/) *CI/CD Pipeline* |

---

> [!IMPORTANT]
> ### 💾 Database DDL & Schema Setup
> The relational telemetry backend uses two tables created inside a free-tier Supabase instance:

```sql
-- Disable Row Level Security (RLS) for public portfolio playground access
ALTER TABLE clinical_pipelines DISABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_logs DISABLE ROW LEVEL SECURITY;

-- 1. Main clinical pipeline definition table
CREATE TABLE clinical_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    target_specialty TEXT NOT NULL,
    clinical_repo_source TEXT NOT NULL, -- e.g. 'AgentClinic + MedAgentBench'
    icd10_validation_supported BOOLEAN DEFAULT TRUE,
    completion_estimate_mins INT DEFAULT 5,
    community_trust_score NUMERIC(3,1) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Telemetry logs table
CREATE TABLE pipeline_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID REFERENCES clinical_pipelines(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL, -- e.g. 'EHR Parse', 'ICD-10 Audit'
    status TEXT NOT NULL,    -- 'Success', 'Warning', 'Contraindication'
    log_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed a verification record
INSERT INTO clinical_pipelines (title, description, target_specialty, clinical_repo_source, icd10_validation_supported, community_trust_score)
VALUES (
    'Cardiovascular Trial Matching & Validation Engine',
    'Automated clinical trial eligibility matching wrapped with an operational billing guardrail.',
    'Cardiology',
    'AgentClinic + MedAgentBench',
    TRUE,
    9.9
);
```

---

## 🤖 Repository Scraper & Automation Cron

To keep the pipeline metadata synchronized, a scheduled Python scraper run checks GitHub repository statistics and updates community trust scores:
* 🐍 **Script**: [medical_scraper.py](scraper/medical_scraper.py) (uses built-in `urllib` to make HTTPS calls with zero extra dependencies).
* ⚙️ **Automation Workflow**: [.github/workflows/scraper.yml](.github/workflows/scraper.yml) (runs every Sunday at midnight UTC).

---

## 📦 Quickstart Setup

1. **Clone & Enter Repo**:
   ```bash
   git clone https://github.com/safevoice009/clinical-middleware-dashboard.git
   cd clinical-middleware-dashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Database Env**:
   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-publishable-token
   ```

4. **Boot Up Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to interact with the play area.

---

> [!NOTE]
> ### 🔗 Ecosystem References
> This middleware aggregates concepts from these open-source clinical reasoning models:
> 1. [AgentClinic](https://github.com/W革新者/AgentClinic) - Simulated doctor-patient dialogue pipelines.
> 2. [MedAgentBench](https://github.com/vinesmsuic/MedAgentBench) - Virtual EHR benchmarking suites.
> 3. [EHRAgent](https://github.com/textviewer/EHRAgent) - Structured database queries over health charts.

---

## 🎓 Developer & Legal Disclaimer

**Developed by Dr. Baddam Sucharith Reddy (AI-Assisted)**  
*Contact & Portfolios*: [LinkedIn Profile](https://www.linkedin.com/in/sucharith007) | [GitHub Profile](https://github.com/safevoice009)

> [!WARNING]
> **Legal Notice**: This software is a proof-of-concept prototype. All patient profiles, clinical narratives, medical codes, policy checks, and database logs are strictly simulated and for demonstration purposes. It should not be used as medical advice or in real production healthcare environments.

