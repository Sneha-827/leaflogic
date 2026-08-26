# LeafLogic — AI Crop Health Decision Support System

AI-powered crop disease analysis for farmers.

🌐 Live Demo: https://leaflogic-psi.vercel.app/

> **Tagline:** *See the signs. Understand the risk. Act smarter.*

LeafLogic is an **AI-powered crop health decision-support system** designed to assist farmers, agricultural extension agents, and agronomists in assessing crop health issues from leaf/crop photography paired with vital farm environmental context (rainfall, symptom duration, and irrigation methods).

LeafLogic is **NOT an autonomous diagnosis system** and never claims 100% certainty. It is engineered with a strict **Confidence Gate** that communicates uncertainty, explains its reasoning, requests missing information, and escalates to qualified agricultural professionals when confidence is low or risk is high.

---

## 🌾 1. The Problem
Diagnosing plant health from a single photograph in isolation is inherently unreliable:
- Fungal diseases, bacterial blights, and physiological nutrient deficiencies often produce overlapping visual symptoms (e.g., foliar chlorosis or leaf spotting).
- Low-resolution or blurry phone images often lead naive AI models to "hallucinate" high-confidence, inaccurate disease diagnoses.
- Premature or inaccurate recommendations cause farmers to apply costly, inappropriate, or hazardous chemical treatments, damaging soil ecosystems and wasting capital.

## 💡 2. The LeafLogic Solution
LeafLogic implements a **multimodal evidence-fusion and decision-support architecture**:
1. **Multimodal Analysis:** Integrates high-resolution leaf photography with crucial agronomic context (crop species, symptom progression timeline, recent rainfall, and irrigation methods).
2. **The Confidence Gate (Core Innovation):** Automatically checks optical clarity and contextual completeness. If the image is blurry or key context is missing, LeafLogic **does not guess**—it informs the user exactly what evidence is missing.
3. **Explainable AI:** Explicitly separates *observed visual facts* (e.g., concentric bullseye rings, chlorotic halos) from *inferences* and provides alternative differential conditions with assigned likelihoods.
4. **Safe Cultural Recommendations:** Recommends non-hazardous physical and cultural actions (drip irrigation, sanitized pruning shears, soil mulching, canopy aeration) and strictly forbids dangerous pesticide cocktail recipes.
5. **Local Privacy:** No user accounts required; all analysis history is stored only in the user's browser.

---

## 🏗️ 3. Technical Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │             Client (React + Vite)            │
                               │  - Image Optimization & Downscaling Canvas   │
                               │  - Agronomic Context Form                    │
                               │  - Confidence Gate Badges & Results Viewer   │
                               │  - Local Browser Storage (History Manager)   │
                               │  - Interactive 13-Point Test Suite           │
                               └──────────────────────┬───────────────────────┘
                                                      │  POST /api/analyze-crop
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │           Node.js / Express Server           │
                               │  - API Key Security (server-side only)       │
                               │  - User-Agent Telemetry Header               │
                               │  - Prompt Synthesis & Safety Directives      │
                               │  - Response Schema Validation                │
                               └──────────────────────┬───────────────────────┘
                                                      │  Multimodal Part Request
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │          Google Gemini 3.7 Flash             │
                               │  - Vision + Context Multimodal Reasoning     │
                               │  - Structured JSON Output (responseSchema)   │
                               │  - Conservative Evidence-Based Evaluation    │
                               └──────────────────────────────────────────────┘
```

---

## 🤖 4. Google Technologies & AI Approach
- **Google GenAI TypeScript SDK (`@google/genai`):** Communicates with the model from the Express server.
- **Gemini 3.7 Flash (`gemini-3.7-flash`):** High-speed, multimodal reasoning engine analyzing image pixels and text context in a single unified prompt.
- **Strict Response Schema (`responseSchema` with `Type.OBJECT`):** Enforces structured JSON output containing:
  - `crop_identified`
  - `image_quality` (`sufficient`, `poor_focus`, `blurry`, `too_far`, etc.)
  - `assessment_status` (`actionable`, `needs_more_info`, `low_confidence`, `inconclusive`)
  - `confidence_score` (conservative 0–100 score)
  - `risk_level` (`Low`, `Moderate`, `High`, `Critical`, `Unknown`)
  - `likely_issues` with `supporting_observations`
  - `alternative_possibilities` for differential diagnosis
  - `observed_evidence` (factual visual observations)
  - `missing_information` (identified gaps)
  - `safe_next_steps` (non-hazardous cultural actions)
  - `expert_verification_required` (escalation flag)
  - `explanation` (transparent reasoning)

---

## 🛡️ 5. Security & Privacy Decisions
- **Zero API Key Leakage:** The `GEMINI_API_KEY` is strictly accessed on the server side (`server.ts`) and is never sent to the browser.
- **Strict Input Validation:**
  - File format checking (JPEG, PNG, WebP only).
  - 10MB maximum file size limit.
  - In-browser canvas downscaling to optimize bandwidth and memory.
- **Safe HTML & Anti-Injection:** AI responses are strictly validated as structured JSON and rendered safely through React elements (no `dangerouslySetInnerHTML`).
- **Privacy First:** No personal profile tracking or telemetry; images are processed in-memory and not stored permanently on server disk.

---

## 🧪 6. Built-In Testing Suite
LeafLogic contains an interactive **13-point diagnostic test suite** directly accessible from the navigation bar:
1. Valid image upload validation
2. Unsupported file type rejection (.pdf, .txt)
3. Oversized image rejection (>10MB)
4. Missing crop information detection
5. Missing symptoms validation check
6. Blurry/poor-quality image Confidence Gate trigger
7. Low-confidence response with expert verification recommendation
8. Valid structured Gemini response parsing
9. Malformed Gemini response graceful recovery
10. Gemini/API network error handling
11. Local history record deletion
12. Clear all local history storage
13. Keyboard accessibility and ARIA landmarks

---

## 🚜 7. Demo Presets Included
Quickly test LeafLogic using the built-in demo scenarios on the home screen:
1. **Tomato Early Blight (Actionable):** Clear concentric rings and chlorotic halos with high humidity and overhead irrigation history.
2. **Cucumber Powdery Mildew (Moderate):** White powdery fungal spots in polyhouse conditions.
3. **Blurry Citrus Leaf (Image Quality Gate):** Demonstrates the Confidence Gate rejecting an out-of-focus photo.
4. **Corn V-Shaped Chlorosis (Context Gap Gate):** Demonstrates nitrogen deficiency vs drought stress with missing soil history.
5. **Apple Cedar Rust (Expert Escalation):** Vivid orange rust spots with nearby cedar trees requiring extension officer confirmation.

---

## 🚀 8. Setup & Development Instructions

### Prerequisites
- Node.js 18+
- A Google Gemini API Key (`GEMINI_API_KEY`)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd leaflogic

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Add your GEMINI_API_KEY inside .env

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Server & Serverless Deployment Configuration

- **Local & Container (Docker / Cloud Run)**: Boots on `http://0.0.0.0:3000` using the custom Express server with Vite middleware in development and static bundle serving in production (`npm start`).
- **Vercel Serverless Deployment**: The app includes native Vercel serverless functions in `/api/analyze-crop.ts` and `/api/health.ts` configured via `vercel.json` rewrites. In Vercel Project Settings, simply set the `GEMINI_API_KEY` Environment Variable.

---

## 📷 9. Image Attributions & Licensing

- **Preset 1 Image (Tomato Early Blight — *Alternaria solani* leaf lesions):**
  - **Creator / Author:** Clemson University - USDA Cooperative Extension Slide Series, Bugwood.org (Image Number: 1233052)
  - **Source:** [Wikimedia Commons — File:Alternaria solani - leaf lesions.jpg](https://commons.wikimedia.org/wiki/File:Alternaria_solani_-_leaf_lesions.jpg)
  - **License:** [Creative Commons Attribution 3.0 United States (CC BY 3.0 US)](https://creativecommons.org/licenses/by/3.0/us/)
  - **License Link:** [https://creativecommons.org/licenses/by/3.0/us/](https://creativecommons.org/licenses/by/3.0/us/)

- **Preset 5 Image (Apple Cedar Rust — *Gymnosporangium juniperi-virginianae* on Crab Apple leaf upper surface):**
  - **Creator / Author:** Littleinfo
  - **Source:** [Wikimedia Commons — File:Cedar apple rust on crab apple leaf upper surface.JPG](https://commons.wikimedia.org/wiki/File:Cedar_apple_rust_on_crab_apple_leaf_upper_surface.JPG)
  - **License:** Public Domain (Released into the public domain by the author; CC0 / PD-self)
  - **License Notes:** Free cultural work with no copyright restrictions.

