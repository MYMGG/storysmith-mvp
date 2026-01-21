SpecName: StorySmith Composite Baseline (Redacted)
Version: v3.0
RedactionLevel: REDACTED_repo_safe
CanonicalActs: 3
SourceInputs:
- docs/_incoming/STAGE 2 — Full Composite Baseline (V3 Pack + ZIP Design Schema) (3).md
LastUpdated: 2026-01-20

# **StorySmith Composite Baseline (Redacted)**

## **1) System Overview**

StorySmith is a multi-act, tool-agnostic workflow that guides a user through: (1) creating a hero + blueprint, (2) writing scene-by-scene story content while capturing illustration prompts, and (3) binding/packaging the story into deliverables (HTML/PDF) with final state artifacts.

## **2) Act Responsibilities**

### **Act I**
- Primary function: hero creation + schema capture.
- Capabilities: Mode toggling between guest-facing and structured data capture roles.

### **Act II**
- Primary function: scene weaving; scene text approval loop; builds and stores illustration prompts; cover prompt planning.
- Capabilities: Mode toggling between guest-facing and structured data capture roles.

### **Act III**
- Primary function: cover binding + centralized image generation + packaging/QA + deliverables.

## **3) Act-by-Act Execution Flows**

### **Act I: Forge the Hero**
**Inputs**
- User choices + hero details.

**Core loop (high-level)**
1. Capture hero details into `StoryState.story_content.CharacterBlock`.
2. Generate hero image prompt and invoke image tool for hero portrait.
   - TOOL_CALL_PLACEHOLDER(provider_unknown, io_contract_unknown)
3. Output `MyHeroAssetBundle_Part1.json` for handoff.

**Primary outputs**
- `MyHeroAssetBundle_Part1.json`

---

### **Act II: Scene Weaver**
**Inputs**
- User uploads `MyHeroAssetBundle_Part1.json`.

**Core loop (high-level)**
1. Load the incoming bundle into `StoryState`.
2. For each scene:
   - Generate full scene text.
   - Present for approval; revisions loop until approved.
   - Construct and store `illustration_prompt` and mark status `pending_illustration` (canonical pipeline defers image generation to Act III).
3. After scenes, design cover concept and store `cover_image_prompt` (image generation deferred to Act III).
4. Output `MyStoryAssetBundle_Part2.json` for handoff.

**Primary outputs**
- `MyStoryAssetBundle_Part2.json`

---

### **Act III: Bind the Book**
**Inputs**
- User uploads `MyStoryAssetBundle_Part2.json`.

**Core loop (high-level)**
1. Load incoming StoryState.
2. Generate cover image via tool invocation and store `Cover.cover_image_url` and `Cover.cover_image_prompt`.
   - TOOL_CALL_PLACEHOLDER(provider_unknown, io_contract_unknown)
3. Canonical: populate `illustration_url` for scenes and compile `AssetsManifest` during Act III binding/packaging.
4. Packaging/QA kernel assembles deliverables (HTML/PDF) and final `StoryState` JSON.

**Primary outputs**
- Polished interactive HTML e-book
- Print-ready PDF
- Final `StoryState` JSON (complete record)
- `AssetsManifest` populated

---

## **4) Kernel Architecture**

### **Stateful Memory Kernel (Continuity & State Engine)**
- **Purpose:** Initialize/load StoryState, update after every user choice, and maintain continuity.
- **Key triggers:** After every choice; before every new question; on asset-bundle load.

### **Context Kernel (Mission Reinforcement & Focus)**
- **Purpose:** Prevent mission drift at transitions and artifact delivery.
- **Key triggers/protocols:**
  - **On Task Transition (Act Change):** Mission recommitment protocol.
  - **On Artifact Delivery (Pre-Generation Check):** Silent confirmation check protocol.

### **Illustration Engine Kernel (Visual Asset Generation)**
- **Purpose:** Translate StoryState into precise image prompts; enforce consistent visual style.
- **Key triggers:** Hero preview generation; cover/scene prompt construction; image generation invocation.

### **Reflex Recovery Kernel (Stability & Session Repair)**
- **Purpose:** Monitor progression for failures and restore last valid state.
- **Key triggers:** Failures, timeouts, or state corruption.

### **Packaging & QA Kernel (Assembly & Verification)**
- **Purpose:** Final QA scan, asset assembly, and deliverable creation.
- **Key triggers:** Completion of all acts; manual export trigger.

---

## **5) Data Contracts**

### **Core state container**
- Wrapper/layering convention: `StoryState` is the standard wrapper.
- Alias rule: `SessionState` treated as an alias for the same logical state object.

### **StoryState.story_content**
Confirmed keys include:
- `CharacterBlock`
- `StoryBlueprintBlock`
- `SceneJSON_array`
- `AssetsManifest`
- `Cover`

### **Scene object fields**
Confirmed fields include:
- `scene_id`, `scene_title`, `scene_status`
- `scene_text_components` (`beginning`, `middle`, `end`)
- `scene_full_text`
- `illustration_prompt`
- `illustration_url`
- `continuity_notes`

---

## **6) Image Pipeline**

### **Canonical pipeline (selected)**
- **Act II:** Stores prompts only.
- **Act III:** Generates images and populates `illustration_url`.

---

## **7) Upgraded Design Schema (PromptTree)**
- PromptTree is a JSON constraint tree for image prompts with priority tiers (MUST/SHOULD/MAY).
- Supports "honest mode" where some items remain in backlog.
- Canonical rendering contract: emit headers, then shotplan hard rules, then prioritized nodes.

---

## **8) Deliverables**
- Act I: `MyHeroAssetBundle_Part1.json`
- Act II: `MyStoryAssetBundle_Part2.json`
- Act III/IV: HTML + PDF + final StoryState JSON + AssetsManifest

---

## **9) Deltas and Naming**
- Bundle root key: `StoryState`
- Alias compatibility: Map `SessionState` -> `StoryState` if encountered.

---

## **10) Open Questions**

### **Q1 — UNKNOWN: Authoritative production image provider/model/tool mapping**
- **Verification step:** Document the production image generator by naming the provider/tool and its exact inputs/outputs.

### **Q2 — UNKNOWN: Where StoryState lives between acts in the production app**
- **Verification step:** Identify the single source of truth in production (DB/server storage/local storage) and the canonical record key/ID.

### **Q3 — UNKNOWN: Concrete implementation path for HTML/PDF generation today**
- **Verification step:** Specify the current implementation (server-side, client-side, or external converter) and the exact file/URL outputs.

### **Q4 — UNKNOWN: PromptTree integration decision**
- **Verification step:** Document whether PromptTree replaces template prompts, translates into template fields, or is used only for stress tests.
