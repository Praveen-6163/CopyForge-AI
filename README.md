# CopyForge AI — Automated Copywriting & Tone Transformer

> **DecodeLabs Generative AI Project 2: Automated Copywriting & Tone Transformer**  
> *"Turn product ideas into platform-ready content."*

CopyForge AI is a content-generation prototype for marketing teams, developers, and founders. It transforms raw product briefs into platform-oriented drafts for **LinkedIn**, **Instagram**, **Email**, **X/Twitter**, **Facebook**, and **Website Landing Pages**.

---

## 🌟 Key Features

- 🧠 **Dynamic Prompt Template Compilation**: Backend constructs structured prompts dynamically based on Product Name, Description, Platform Rules, Tone Directives, Target Audience, Content Objective, and custom instructions.
- 🎛️ **Advanced Generation Parameters**: Fine-tune output creativity with Temperature (0.0 – 1.0), Top-P Nucleus Sampling (0.0 – 1.0), and Max Output Token controls with inline explanatory guides.
- 📐 **Backend Platform Constraints Engine**: Modular platform rules enforced directly in backend generation logic (hooks, paragraph line breaks, character boundaries, emoji styling, CTAs, hashtags, subject line formatting).
- 🛡️ **Output Validation & Formatting Service**: Strips conversational preambles, validates structural requirements (e.g. Email subject lines, Twitter character gauges), and provides diagnostic pass/warning feedback.
- ⚡ **Asynchronous Execution & Retry Logic**: Async FastAPI backend featuring exponential backoff retries with randomized jitter to handle OpenAI rate limits (HTTP 429) and transient errors gracefully.
- 🔌 **Seamless Demo Mode**: Fully operational out-of-the-box without an API key using a high-quality local generation engine for easy testing and evaluation.
- 💾 **SQLite History & Bookmarks**: Save, search, filter by platform/tone, delete, and reopen past generations seamlessly.
- 📑 **Preset Form formulas & Templates**: 7 built-in templates (Product Launch, Startup Announcement, Thought Leadership, etc.) for one-click form completion.
- 🔍 **Prompt Inspector**: View exact compiled system and user prompts sent to the backend LLM engine.
- 📤 **Multi-Format Export**: One-click Copy, TXT export, Markdown export, and Web Share API integration.

## Demo Deployment Scope

The Netlify site runs as a static frontend. Without `VITE_API_BASE_URL`, copy generation, history, bookmarks, templates, and workspace preferences use the browser's local demo engine and local storage. Trend cards, analytics, calendar entries, approval items, and artwork are sample data. LinkedIn OAuth is enabled only when its server-side credentials are configured; live trend feeds, image generation, background scheduling, and external publishing are not configured and do not run.

## LinkedIn OAuth setup

LinkedIn OAuth is implemented in the existing FastAPI backend. In the LinkedIn Developer Portal, register the exact callback URL used by `LINKEDIN_REDIRECT_URI` and enable the OpenID Connect profile product plus the `w_member_social` member posting permission. Copy `.env.example` to an untracked `.env` file and fill in `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`, and a random `SECRET_KEY` of at least 32 characters. Set `FRONTEND_ORIGIN` to the exact frontend origin (for example, `http://localhost:3000` during local development). The current backend default is port 8000; if registering the supplied local callback on port 5000, run the backend on port 5000 and point the local frontend API base/proxy to that port, or register a callback on port 8000 instead.

The callback URL must resolve to the running backend and exactly match the URL registered in LinkedIn; do not use the local example callback for a deployed backend. Deploy the FastAPI backend over HTTPS, configure the same environment variables there, set the frontend build variable `VITE_API_BASE_URL` to the backend origin, and set `FRONTEND_ORIGIN` to the deployed frontend origin. Keep the client secret and `.env` on the server only. LinkedIn access tokens are encrypted before storage in the backend SQLite database; the status API never returns tokens. OAuth connection does not itself publish content.

---

## 🏗️ Architecture & Conceptual Flow

```
User Input Brief (Product, Platform, Tone, Audience, Objective, Params)
                          │
                          ▼
             1. Input Validation & Pydantic Schemas
                          │
                          ▼
            2. Dynamic Prompt Compiler Service
     (Compiles System Prompt, User Prompt & Directives)
                          │
                          ▼
          3. Platform Rules & Tone Directives Engine
   (LinkedIn / IG / Email / Twitter / FB / Web Rules)
                          │
                          ▼
         4. AI Service (Async OpenAI SDK / Demo Fallback)
    (Exponential Backoff, Rate Limit Jitter, 30s Timeout)
                          │
                          ▼
           5. Output Validation & Formatter Service
      (Prefix Stripping, Structure Verification, Gauges)
                          │
                          ▼
          6. SQLite Storage & Interactive Editor Output
```

---

## ⚙️ Parameter Tuning Guide

| Parameter | Range | Default | Purpose |
| :--- | :--- | :--- | :--- |
| **Temperature** | `0.0` → `1.0` | `0.5` | Controls creativity and randomness. `0.2` = structured & factual; `0.8` = highly creative marketing copy. |
| **Top-P** | `0.0` → `1.0` | `0.9` | Nucleus sampling threshold. Limits token pool selection to top cumulative probability mass. |
| **Max Tokens** | `100` → `2000` | `750` | Maximum token ceiling for output length (~750 tokens ≈ 500 words). |

---

## 📱 Platform Rules Breakdown

- **LinkedIn**: Thought-leadership opening hook, line-spaced short paragraphs, value insights, comment-driving CTA, 3-5 hashtags.
- **Instagram**: High-energy visual hook, short readable emoji sections, link-in-bio CTA, hashtag cluster.
- **X/Twitter**: Character-aware output (<280 chars single tweet or structured 1/, 2/ thread), zero fluff, punchy CTA.
- **Email**: Formatted headers (`SUBJECT LINE:`, `PREVIEW TEXT:`, `GREETING:`, `BODY:`, `CALL TO ACTION:`, `SIGN-OFF:`).
- **Facebook**: Story-driven conversational flow, community question CTA.
- **Website/Product Page**: Hero Headline (`#`), Subheadline (`##`), 3 Key Benefit bullet points (`###`), Primary CTA.

---

## 🚀 Environment Setup & Installation

### Prerequisites
- **Python**: `3.11+`
- **Node.js**: `v18+` or `v20+`

### 1. Clone & Configure Environment

Create `.env` file in the project root:

```bash
# CopyForge AI Environment Variables

# OpenAI API Key (Leave blank to enable Demo Mode automatically)
OPENAI_API_KEY=

# OpenAI Model configuration
OPENAI_MODEL=gpt-4o-mini

# Backend Port
PORT=8000
```

---

## 🏃 Running the Application

### Option A: Running Backend & Frontend Together

#### Step 1: Start Backend Server
```bash
# Navigate to backend
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtualenv
# On Windows PowerShell / CMD:
venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Start FastAPI Uvicorn Server (Port 8000)
python run.py
```
> Backend API will be active at: `http://localhost:8000` (API Swagger Docs at `http://localhost:8000/docs`)

#### Step 2: Start Frontend Application
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start Vite Development Server (Port 3000)
npm run dev
```
> Open browser at: `http://localhost:3000`

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/generate` | Main content generation endpoint |
| `POST` | `/api/improve` | Refines copy (make shorter, make longer, change tone, change platform) |
| `POST` | `/api/regenerate` | Re-executes generation with tweaked parameters |
| `GET` | `/api/history` | Fetches SQLite generation history with search/filter queries |
| `GET` | `/api/history/{id}` | Fetches single history record by ID |
| `DELETE` | `/api/history/{id}` | Deletes history record by ID |
| `POST` | `/api/history/{id}/toggle-save` | Toggles bookmark status |
| `GET` | `/api/templates` | Returns list of preset prompt formulas |
| `GET` | `/api/health` | Returns health status, OpenAI model, and Demo Mode indicator |

---

## 🧪 Testing

Run automated backend verification tests:
```bash
python backend/test_api.py
```

Run frontend production build verification:
```bash
cd frontend
npm run build
```

### Deploy to Netlify

Connect the repository to Netlify and use the repository root as the base directory. The root `netlify.toml` installs the frontend from its lockfile, builds it, publishes `frontend/dist`, and configures SPA route fallback. Without `VITE_API_BASE_URL`, the site uses its browser-based demo engine. Set that variable to the deployed FastAPI origin (the app appends `/api`) only when a backend is available. Trigger a new production deploy after changing the deployment configuration.

---

## 🎯 DecodeLabs Project Compliance Checklist

- [x] Dynamic prompt template compilation
- [x] Product name variable & description
- [x] Platform selection (LinkedIn, Instagram, Email, X/Twitter, Facebook, Website)
- [x] Tone selection (8 curated tones)
- [x] Temperature & Top-P control sliders
- [x] Platform-specific output constraints
- [x] Post-generation output validation & prefix stripping
- [x] Async execution, retry logic & rate limit jitter
- [x] SQLite database history storage
- [x] Demo mode fallback when API key is unconfigured
- [x] Professional SaaS "Creative AI Studio" UI/UX
