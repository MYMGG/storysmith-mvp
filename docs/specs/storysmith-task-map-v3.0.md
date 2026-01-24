SpecName: StorySmith Task Map
Version: v3.0
GeneratedAt: 2026-01-21T09:56:00-05:00
Branch: feature/html-book-viewer
CommitSHA: 56a0e7d
Safety: REDACTED_repo_safe — no proprietary prompts included

# StorySmith Implementation Task Map (v3.0)

This document maps the canonical spec (`storysmith-composite-baseline-v3.0-redacted.md`) to the current codebase and defines a dependency-ordered implementation backlog.

---

## A) Current-State Snapshot

### Macro Act Structure (v4.0)

StorySmith v4.0 reframes the creation journey into **10 Macro Acts** across 4 explicit phases.

#### Phase Separation

| Phase | Macro Acts | Primary Outputs |
|:---|:---|:---|
| **BLUEPRINT** | 1A (Spark), 1B (Identity), 1C (Portrait), 2A (Story Spark) | Hero + Premise |
| **MANUSCRIPT** | 2B (Scene Architect) | Scenes + Prompts |
| **ILLUSTRATION** | 3A (Import Assets), 3B (Illustration Loop) | All Images |
| **PACKAGING** | 3C (Assets Manifest), 3D (Grand Unveiling) | Final Bundle + Viewer |

#### Accomplishment Landing Pages

Each Macro Act concludes with an **Accomplishment Landing Page** that reveals:
- **Artifact**: The deliverable created (Hero Card, Blueprint, etc.)
- **Badge**: Visual stamp of completion (text-first; icons OPTIONAL, e.g., "Portrait Forged" or "Portrait Forged 🎨")
- **Premium Copy**: Motivational 1-sentence message (tone shifts from playful → craftsmanship → ceremonial pride)
- **Next Action**: Button to continue workflow or export

**Badge Tone Guideline**: Premium, not juvenile or gimmicky. Text-first; emoji/icons are strictly optional visual enhancements.

**Implementation**: See TS-021 (Landing Page Pattern), TS-017 (Hero Card + Act 1 badges), TS-018 (Story Blueprint + Act 2 badge), TS-019 (Production Checklist with all badges), TS-020 (Grand Unveiling + Act 3 badges).

#### Macro Act Definitions

| Act | Stations | Landing Page Badge | Maps to TS |
|:---|:---|:---|:---|
| **1A: Spark Capture** | Photo upload, concept prompt | "Spark Captured" (OPTIONAL: ✨) | TS-006, TS-017 |
| **1B: Hero Identity** | Traits/flaw/goal (Basic: 5 prompts; Premium: 20–30 Q's) | "Identity Forged" (OPTIONAL: 🛡️) | TS-017, TS-023 |
| **1C: Portrait Forge** | Generate hero image, optional retry | "Portrait Forged" (OPTIONAL: 🎨) | TS-017, TS-006 |
| **2A: Story Spark** | Premise (Basic: 1 prompt; Premium: 20–30 Q's) | "Story Spark Ignited" (OPTIONAL: 💡) | TS-007, TS-024 |
| **2B: Scene Architect** | Scene outline, approval loop, illustration prompts | "Blueprint Complete" (OPTIONAL: 📐) | TS-008, TS-009, TS-018 |
| **3A: Import Assets** | Upload Part2 bundle, display summary | "Production Ready" (OPTIONAL: 🎬) | TS-010, TS-019 |
| **3B: Illustration Loop** | Generate all scene + cover images | "Illustrations Complete" (OPTIONAL: 🖼️) | TS-011, TS-015, TS-019, TS-022 |
| **3C: Assets Manifest** | Compile all URLs + metadata | "Assets Packaged" (OPTIONAL: 📦) | TS-012 |
| **3D: Grand Unveiling** | Display cover, credits, viewer launch, final export | "Book Published" (OPTIONAL: 🏆) | TS-020, TS-013, TS-014 |

**Total MVP Scope**: 8 Macro Acts (1A through 3D). Acts 4+ (Visual Calibration, Audio Narration, etc.) deferred to post-MVP.

### Acts Implemented
| Act | API Route | UI Component | Status |
| :--- | :--- | :--- | :--- |
| Act I | `pages/api/forge-hero.js` | `components/ForgeHero.js` | Partial (no bundle export) |
| Act II | `pages/api/scene-weaver.js` | `components/SpinTale.js` | Partial (no bundle import/export) |
| Act III | `pages/api/bind-book.js` | `components/BindBook.js` | Partial (no image loop, no PDF) |

### Viewer Status
- **Route**: `pages/viewer/[bookId].js`
- **Components**: 12 files in `components/viewer/`
- **Status**: Functional for reading; hotspots working

### StoryState Status
- **Schema Module**: `lib/storyState.js` ✅
- **Persistence**: localStorage via `hooks/useBookState.js` ✅
- **Canonical Envelope**: `story_state` field persisted in viewer ✅

### Image Pipeline Status
- **API**: `pages/api/generateImage.js` (DALL-E 3)
- **Act II prompts-only**: NOT enforced
- **Act III central loop**: NOT implemented

### Export/Import Status
- **Bundle Export UI**: NOT implemented
- **Bundle Import UI**: NOT implemented

### PDF Status
- **PDF Export**: NOT implemented

### Persistence Status
- **Current**: localStorage only
- **Server-side DB**: NOT implemented

---

## B) Task Backlog

### TS-001: DECISION — Persistence Strategy ✅ COMPLETE
- **Title**: Decide production persistence mechanism
- **Priority**: P0
- **DependsOn**: None
- **SpecRefs**: §10 Open Questions Q2
- **FilesLikelyTouched**: docs/specs/ (decision record only)
- **Decision**: **(A) localStorage (browser-only) for MVP**
- **Scope**: Viewer + act flows store StoryState locally per book/session_id
- **Risks**:
  - Clearing browser storage loses all progress
  - No cross-device resume capability
  - Storage limits (~5MB per origin)
- **Deferred**: Phase 5 server-side persistence (Firebase/Supabase) for multi-device sync
- **AcceptanceCriteria**:
  - [x] Document chosen option: (A) localStorage only
  - [x] Record rationale and migration path
  - [x] Update delta log with decision
- **Verification**: Decision documented in task map and delta log
- **Status**: COMPLETE (2026-01-21)

---

### TS-002: DECISION — PDF Export Strategy ✅ COMPLETE
- **Title**: Decide PDF generation approach
- **Priority**: P1
- **DependsOn**: None
- **SpecRefs**: §10 Open Questions Q3, §8 Deliverables
- **FilesLikelyTouched**: docs/specs/ (decision record only)
- **Decision**: **(C) defer to post-MVP**
- **Scope**: PDF export not included in MVP; prioritize HTML viewer and bundle handoff
- **Rationale**:
  - MVP timeline is tight; PDF adds significant complexity
  - HTML e-book viewer (TS-014) satisfies core "readable book" deliverable
  - Server-side Puppeteer requires infrastructure changes
  - Client-side @react-pdf/renderer has bundle size and layout limitations
  - Defer until TS-013 (Final Export) and TS-014 (Viewer Integration) are stable
- **AcceptanceCriteria**:
  - [x] Document chosen option: (C) defer to post-MVP
  - [x] Record trade-offs
  - [x] Update delta log with decision
- **Verification**: Decision documented in task map, delta log, and decision record
- **Status**: COMPLETE (2026-01-21)
- **DecisionRecord**: docs/specs/decisions/TS-002-pdf-export-strategy.md
- **Risk/Notes**:
  - Server-side requires infra changes
  - Revisit trigger: after TS-013 Final Export + TS-014 Viewer Integration complete

---

### TS-003: DECISION — PromptTree Integration ✅ COMPLETE
- **Title**: Decide PromptTree usage stance
- **Priority**: P2
- **DependsOn**: None
- **SpecRefs**: §7 PromptTree, §10 Open Questions Q4
- **FilesLikelyTouched**: docs/specs/ (decision record only)
- **Decision**: **(C) stress-test only for MVP**
- **Scope**: PromptTree used as QA/stress-test harness only; no runtime dependency
- **Rationale**:
  - Keep plain-text templates as production source of truth
  - Use PromptTree to validate constraint coverage and stress-test prompt assembly
  - Defer translation/replacement until post-MVP after contracts + bundle handoff stabilize
  - Reduces implementation risk during critical MVP phase
- **AcceptanceCriteria**:
  - [x] Document chosen option: (C) stress-test only
  - [x] Record rationale
  - [x] Update delta log with decision
- **Verification**: Decision documented in task map, delta log, and decision record
- **Status**: COMPLETE (2026-01-21)
- **DecisionRecord**: docs/specs/decisions/TS-003-prompttree-integration.md
- **Risk/Notes**:
  - Current implementation uses plain-text templates
  - Revisit trigger: after TS-002 bundle handoff + canonical StoryState contracts are complete

---

### TS-004: Implement Bundle Export Utility ✅ COMPLETE
- **Title**: Create reusable bundle export function
- **Priority**: P0
- **DependsOn**: TS-001
- **SpecRefs**: §3 Act Flows (outputs), §8 Deliverables
- **DetailedPlan**: See `docs/specs/storysmith-bundle-handoff-plan-v3.0.md` §1, §4.1
- **FilesLikelyTouched**:
  - `lib/bundleExporter.js` (NEW)
  - `lib/storyState.js` (extend if needed)
- **AcceptanceCriteria**:
  - [x] `exportBundle(storyState, bundleType)` returns downloadable JSON
  - [x] Supports Part1, Part2, Final bundle types
  - [x] Uses canonical `StoryState` wrapper format per handoff plan
  - [x] Filename matches spec: `MyHeroAssetBundle_Part1.json`, etc.
- **Verification**: `npm run build` passes; exported JSON matches handoff plan schema
- **Status**: COMPLETE (2026-01-21)
- **Risk/Notes**:
  - Foundation for all handoff tasks

---

### TS-005: Implement Bundle Import Utility ✅ COMPLETE
- **Title**: Create reusable bundle import function
- **Priority**: P0
- **DependsOn**: TS-004
- **SpecRefs**: §3 Act Flows (inputs), §5 Data Contracts
- **DetailedPlan**: See `docs/specs/storysmith-bundle-handoff-plan-v3.0.md` §2, §4.1
- **FilesLikelyTouched**:
  - `lib/bundleImporter.js` (NEW)
  - `lib/bundleValidator.js` (NEW)
  - `lib/storyState.js` (validation)
- **AcceptanceCriteria**:
  - [x] `importBundle(file)` parses and validates JSON
  - [x] Returns normalized `StoryState` via `normalizeToStoryState()`
  - [x] Handles `SessionState` alias mapping
  - [x] Rejects invalid bundles with error messages per handoff plan §2.3
- **Verification**: `npm run build` passes; bundle validation tested via sanity script
- **Status**: COMPLETE (2026-01-21)
- **MergedPR**: #12
- **Risk/Notes**:
  - Legacy format migration supported via `migrateLegacyBundle()`

---

### TS-006: Add Export Button to ForgeHero (Act I) ✅ COMPLETE
- **Title**: Add "Export Hero Bundle" UI to Act I
- **Priority**: P0
- **DependsOn**: TS-004
- **SpecRefs**: §3 Act I outputs
- **FilesLikelyTouched**:
  - `components/ForgeHero.js`
- **AcceptanceCriteria**:
  - [x] Button visible after hero creation complete
  - [x] Downloads `MyHeroAssetBundle_Part1.json`
  - [x] Bundle contains `StoryState` with `CharacterBlock` populated
  - [x] Bundle passes `isValidStoryState()` check
- **Verification**: Complete Act I flow; JSON structure matches handoff plan; Manual export verified (2026-01-21)
- **Status**: COMPLETE (2026-01-21)
- **MergedPR**: #13
- **Risk/Notes**:
  - Added step 4 completion screen with export + continue buttons
  - Fixed "Missing CharacterBlock" error by initializing valid StoryState in pages/index.js
- **v4 Addenda (for reference)**:
  - Export button appears on Act 1C Accomplishment Landing Page alongside Hero Card (see TS-017, TS-021)
  - If Premium mode active, Part1 bundle must include `metadata.hero_question_responses` (see TS-023, TS-025)

---

### TS-007: Add Import UI to SpinTale (Act II) ✅ COMPLETE
- **Title**: Add "Import Hero Bundle" UI to Act II
- **Priority**: P0
- **DependsOn**: TS-005, TS-006
- **SpecRefs**: §3 Act II inputs
- **DetailedPlan**: See `docs/specs/plans/TS-007-spintale-import-ui-plan.md`
- **FilesLikelyTouched**:
  - `components/SpinTale.js`
- **AcceptanceCriteria**:
  - [x] File upload input on Act II start
  - [x] Validates uploaded bundle
  - [x] Populates StoryState with `CharacterBlock` from bundle
  - [x] Shows error for invalid bundles
- **Verification**: Export from Act I → Import to Act II → Hero data visible (Verified 2026-01-21)
- **Status**: COMPLETE (2026-01-21)
- **Risk/Notes**:
  - UX: consider drag-drop support
- **v4 Addenda (for reference)**:
  - After successful import, "Story Spark Ignited" badge displays (see Act 2A spec in Section A.1)
  - If Premium mode active, load TS-024 question pack

---

### TS-008: Enforce Act II Prompts-Only Pipeline ✅ COMPLETE
- **Title**: Ensure Act II stores illustration_prompt without generating images
- **Priority**: P1
- **DependsOn**: TS-007
- **SpecRefs**: §6 Image Pipeline
- **FilesLikelyTouched**:
  - `pages/api/scene-weaver.js`
  - `components/SpinTale.js`
- **AcceptanceCriteria**:
  - [x] Scene approval stores `illustration_prompt` in `SceneJSON_array[i]`
  - [x] `scene_status` set to `pending_illustration`
  - [x] NO image generation calls in Act II
  - [x] `illustration_url` remains null/empty
- **Verification**: Complete scene in Act II; verify exported bundle has prompts but no URLs (Verified 2026-01-21 via TS-009 export)
- **Status**: COMPLETE (2026-01-21)
- **Risk/Notes**:
  - May require removing existing image generation calls
- **v4 Addenda (for reference)**:
  - **MVP Scene Count**: Minimum 3 scenes acceptable for MVP; target 8–12 for premium feel; paid tier should enforce 12+ minimum
  - After all scenes approved, "Blueprint Complete" badge displays (see TS-018 Accomplishment Landing Page)

---

### TS-009: Add Export Button to SpinTale (Act II) ✅ COMPLETE
- **Title**: Add "Export Story Bundle" UI to Act II
- **Priority**: P0
- **DependsOn**: TS-008
- **SpecRefs**: §3 Act II outputs
- **FilesLikelyTouched**:
  - `components/SpinTale.js`
- **AcceptanceCriteria**:
  - [x] Button visible after all scenes approved
  - [x] Downloads `MyStoryAssetBundle_Part2.json`
  - [x] Bundle contains `SceneJSON_array` with prompts
  - [x] Bundle contains `cover_image_prompt`
- **Verification**: Complete Act II flow; verify downloaded JSON structure (Verified manually 2026-01-21)
- **Status**: COMPLETE (2026-01-21)
- **Risk/Notes**:
  - Requires tracking "all scenes complete" status
- **v4 Addenda (for reference)**:
  - Export button appears on Act 2B Accomplishment Landing Page alongside Story Blueprint (see TS-018, TS-021)
  - If Premium mode active, Part2 bundle must include `metadata.story_question_responses` (see TS-024, TS-025)

---

### TS-010: Add Import UI to BindBook (Act III) ✅ COMPLETE
- **Title**: Add "Import Story Bundle" UI to Act III
- **Priority**: P0
- **DependsOn**: TS-009
- **SpecRefs**: §3 Act III inputs
- **FilesLikelyTouched**:
  - `components/BindBook.js`
- **AcceptanceCriteria**:
  - [x] File upload input on Act III start
  - [x] Validates uploaded Part2 bundle
  - [x] Populates StoryState with scenes/prompts from bundle
  - [x] Shows error for invalid bundles
- **Verification**: Export from Act II → Import to Act III → Scenes/prompts visible (Verified 2026-01-21)
- **Status**: COMPLETE (2026-01-21)
- **Risk/Notes**:
  - UX: show summary of imported content
- **v4 Addenda (for v4.0 integration)**:
  - [ ] After successful import, "Production Ready" badge displays (Act 3A Accomplishment Landing Page, see TS-021)
  - [ ] Production Checklist (TS-019) initializes: Hero ✅, Scenes ✅, Prompts ✅, Illustrations (0/N)

---

### TS-011: Implement Act III Image Generation Loop
- **Title**: Add central image generation loop in Act III
- **Priority**: P1
- **DependsOn**: TS-010
- **SpecRefs**: §3 Act III flow, §6 Image Pipeline
- **FilesLikelyTouched**:
  - `pages/api/bind-book.js` or new `pages/api/generate-scene-images.js`
  - `components/BindBook.js`
- **AcceptanceCriteria**:
  - [ ] Loop iterates all `pending_illustration` scenes
  - [ ] Calls `generateImage` API for each scene prompt
  - [ ] Populates `illustration_url` in `SceneJSON_array[i]`
  - [ ] Updates `scene_status` to `illustrated`
  - [ ] Generates cover image and populates `Cover.cover_image_url`
  - [ ] **Seed Capture** (see TS-022): Each image generation call captures variation seed (from API response metadata or generate UUID) and stores in `SceneJSON_array[i].illustration_metadata.seed`
  - [ ] **Weighted Pools/Constraints** (see TS-022): If `visual_style` or `visual_consistency_tag` set in `story_data`, prepend style keywords to all image prompts (e.g., "watercolor style, ...")
  - [ ] **Anti-Samey Safeguard** (see TS-022): After each scene image generation:
    - Compute perceptual hash (pHash or dHash) of output image
    - Compare to all previous scene images in same book
    - If similarity >80%, retry with incremented seed (append `_retry_N`) up to 3 attempts
    - Log collision events; accept final output if all retries fail
  - [ ] Cover image applies same seed capture + anti-samey logic
  - [ ] After all images generated, "Illustrations Complete" badge displays (Act 3B Accomplishment Landing Page, see TS-021)
- **Verification**: Import Part2 bundle → Trigger generation → All scenes have URLs
  - Manual anti-samey test: Import Part2 with 12 identical scene prompts → generate images → visual inspection confirms <2 near-duplicates per book
  - Automated test: See TS-026 for formal test suite
- **Risk/Notes**:
  - Rate limiting/error handling needed
  - Consider progress UI (see TS-019)
  - **ASSUMPTION**: Perceptual hash (80% threshold) effectively detects "samey" images (VERIFY via TS-026 test suite + manual inspection)
  - **ASSUMPTION**: DALL-E 3 provides enough natural variation that anti-samey retry is rarely triggered (<10% of generations; VERIFY via production metrics post-launch)

---

### TS-012: Populate AssetsManifest in Act III
- **Title**: Compile AssetsManifest after image generation
- **Priority**: P1
- **DependsOn**: TS-011
- **SpecRefs**: §3 Act III outputs, §5 Data Contracts
- **FilesLikelyTouched**:
  - `components/BindBook.js` or `lib/storyState.js`
- **AcceptanceCriteria**:
  - [ ] `AssetsManifest.hero_image` populated (if exists)
  - [ ] `AssetsManifest.scene_images[]` contains all scene URLs
  - [ ] `AssetsManifest.cover_image` populated
  - [ ] AssetsManifest includes `generation_metadata: { seeds: [...] }` array with all seeds captured during TS-011
  - [ ] After manifest compiled, "Assets Packaged" badge displays (Act 3C Accomplishment Landing Page, see TS-021)
- **Verification**: Verify final StoryState JSON contains complete AssetsManifest with seed metadata
- **Risk/Notes**:
  - Simple aggregation task

---

### TS-013: Add Final Bundle Export to BindBook (Act III)
- **Title**: Add "Export Final Bundle" UI to Act III
- **Priority**: P0
- **DependsOn**: TS-012
- **SpecRefs**: §8 Deliverables
- **FilesLikelyTouched**:
  - `components/BindBook.js`
- **AcceptanceCriteria**:
  - [ ] Button visible after all images generated
  - [ ] Downloads final `StoryState` JSON with complete data
  - [ ] All fields populated: CharacterBlock, SceneJSON_array (with URLs), Cover, AssetsManifest
  - [ ] Export button appears on Grand Unveiling screen (Act 3D Accomplishment Landing Page, see TS-020, TS-021)
  - [ ] If Premium mode active, final bundle includes all `hero_question_responses` + `story_question_responses` (see TS-023, TS-024, TS-025)
- **Verification**: Complete Act III flow; verify downloaded JSON is complete with all Premium data if applicable
- **Risk/Notes**:
  - Milestone: complete story artifact

---

### TS-014: HTML Viewer Integration with Final Bundle
- **Title**: Allow viewer to load final StoryState bundles
- **Priority**: P1
- **DependsOn**: TS-013
- **SpecRefs**: §8 Deliverables (HTML e-book)
- **FilesLikelyTouched**:
  - `pages/viewer/[bookId].js`
  - `lib/storyState.js` (toViewerBook adapter)
- **AcceptanceCriteria**:
  - [ ] Viewer can load final bundle JSON directly
  - [ ] All scenes render with generated images
  - [ ] Cover displays correctly
  - [ ] Navigation works end-to-end
- **Verification**: Export final bundle → Load in viewer → All pages display
- **Risk/Notes**:
  - May need file upload UI or URL parameter

---

### TS-015: Error Recovery UI (Minimal MVP)
- **Title**: Add basic retry/recovery UI for failures
- **Priority**: P2
- **DependsOn**: TS-011
- **SpecRefs**: §4 Reflex Recovery Kernel
- **FilesLikelyTouched**:
  - `components/BindBook.js`
  - `components/SpinTale.js`
- **AcceptanceCriteria**:
  - [ ] API errors show user-friendly message
  - [ ] "Retry" button available after failure
  - [ ] State not lost on failure
  - [ ] Per-scene retry buttons integrated into Production Checklist (TS-019): failed scenes show "❌ Retry" status with clickable button
  - [ ] Retry for image generation respects anti-samey logic (TS-011, TS-022): retries use incremented seed to avoid repeating same output
- **Verification**: Simulate API failure → Retry → Operation succeeds; verify retry uses different seed if collision detected
- **Risk/Notes**:
  - MVP version; full kernel implementation deferred

---

### TS-017: Prestige Artifact — Hero Card + Progress Passport
- **Title**: Add collectible “Hero Card” and station progress indicator (Act I)
- **Priority**: P1
- **DependsOn**: TS-006
- **SpecRefs**: §3 Act I outputs, §8 Deliverables (presentation/readability)
- **FilesLikelyTouched**:
  - `components/ForgeHero.js`
  - `components/viewer/` (optional display panel)
  - `hooks/useBookState.js` (if needed for persistence)
- **AcceptanceCriteria**:
  - [ ] After hero creation completes, UI shows a "Hero Card" panel that looks collectible and premium (not childish):
    - hero name + tagline
    - 3 defining traits
    - 1 flaw/weakness
    - 1 goal
    - hero portrait (or tasteful placeholder if none)
  - [ ] Hero Card content is derived from existing `CharacterBlock` fields (avoid new schema fields unless strictly necessary)
  - [ ] **Define explicit Stations** for Progress Passport (Station 1–4, mapping to Macro Acts per v4.0):
    - **Station 1 (Act 1A)**: "Spark Captured" (OPTIONAL icon: ✨) — photo uploaded (or skipped) + concept entered
    - **Station 2 (Act 1B)**: "Identity Forged" (OPTIONAL icon: 🛡️) — traits/flaw/goal defined (Basic: 5 prompts; Premium: 20–30 questions via TS-023)
    - **Station 3 (Act 1C)**: "Portrait Forged" (OPTIONAL icon: 🎨) — hero image generated
    - **Station 4 (Act 2A)**: "Story Spark Ignited" (OPTIONAL icon: 💡) — premise/logline defined (Basic: 1 prompt; Premium: 20–30 questions via TS-024)
  - [ ] Progress Passport UI shows 4 stamps with text-first badge names (icons optional)
  - [ ] **Accomplishment Landing Page** (Act 1C complete, Station 3):
    - **Artifact Revealed**: Full Hero Card with portrait
    - **Badge Name**: "Portrait Forged" (icon optional, premium tone)
    - **Premium Copy**: "Behold your hero. The journey is just beginning." (or similar premium/motivational message)
    - **Next Buttons**: "Download Hero Bundle" + "Continue to Story Creation →"
  - [ ] Existing export flow remains intact (`MyHeroAssetBundle_Part1.json`)
- **Verification**: Manual test: complete Act I → confirm Hero Card + Passport stamps (Station 1–3) render → export still downloads and validates → check responsive at ~360px width
- **DependsOn**: TS-006, TS-023 (optional, for Premium mode Station 2)
- **Risk/Notes**:
  - Keep micro-animations subtle; avoid confetti/“kiddy” effects
  - Station 4 (Story Spark) technically starts Act II but is part of "Blueprint Phase" — Progress Passport may span Acts I+II front matter

---

### TS-018: Prestige Artifact — Story Blueprint (Arc + Scene Map)
- **Title**: Generate and display a “Story Blueprint” (Act II completion + viewer-ready)
- **Priority**: P1
- **DependsOn**: TS-009
- **SpecRefs**: §3 Act II outputs, §5 Data Contracts (derive from scenes), §8 Deliverables
- **FilesLikelyTouched**:
  - `components/SpinTale.js`
  - `components/viewer/` (Blueprint panel)
  - `lib/` (optional helper: `blueprintFromStoryState.js`)
- **AcceptanceCriteria**:
  - [ ] After Act II completion, show a "Story Blueprint" section that makes the work feel earned:
    - 1-paragraph premise/logline
    - numbered scene list (title + 1-sentence beat each)
    - optional: theme/moral line (single sentence)
  - [ ] Blueprint is deterministic from `StoryState` (prefer derive-on-demand over schema changes)
  - [ ] Blueprint is available to display later when the final bundle is viewed (viewer reads StoryState and can render the Blueprint)
  - [ ] **Accomplishment Landing Page** (Act 2B complete):
    - **Artifact Revealed**: Story Blueprint (logline + numbered scene list)
    - **Badge Name**: "Blueprint Complete" (OPTIONAL icon: 📐)
    - **Premium Copy**: "Your story's skeleton is ready. Now let's add the flesh and blood." (or similar premium message)
    - **Next Buttons**: "Download Story Bundle" + "Continue to Production →"
  - [ ] If Premium mode active (TS-024), blueprint includes:
    - More detailed scene beats (derived from `story_question_responses`)
    - Explicit theme/moral statement (1 sentence from question pack)
  - [ ] If Basic mode, blueprint is minimal (logline + scene titles only, no detailed beats)
- **Verification**: Manual test: complete Act II → Blueprint displays → export Part2 bundle → later import through Act III and load final in viewer → Blueprint can be shown from StoryState-derived data
- **DependsOn**: TS-009, TS-024 (optional, for Premium mode)
- **Risk/Notes**:
  - Avoid long text walls; blueprint is a "map," not the full manuscript

---

### TS-019: Production Checklist + Visible Progress (No Dead Waiting)
- **Title**: Add “Production Checklist” and progress UI across Acts II/III + viewer
- **Priority**: P1
- **DependsOn**: TS-011
- **SpecRefs**: §6 Image Pipeline, §8 Deliverables, §4 Reflex Recovery Kernel (UX clarity)
- **FilesLikelyTouched**:
  - `components/SpinTale.js`
  - `components/BindBook.js`
  - `components/viewer/` (optional status panel)
- **AcceptanceCriteria**:
  - [ ] Show a "Production Checklist" that updates as the user progresses with **badges for all completed Macro Acts**:
    - "Spark Captured" (Act 1A, OPTIONAL icon: ✨)
    - "Identity Forged" (Act 1B, OPTIONAL icon: 🛡️)
    - "Portrait Forged" (Act 1C, OPTIONAL icon: 🎨)
    - "Story Spark Ignited" (Act 2A, OPTIONAL icon: 💡)
    - "Blueprint Complete" (Act 2B, OPTIONAL icon: 📐)
    - "Production Ready" (Act 3A, OPTIONAL icon: 🎬)
    - "Illustrations Complete" (Act 3B, OPTIONAL icon: 🖼️) — in-progress during image loop
    - "Assets Packaged" (Act 3C, OPTIONAL icon: 📦)
  - [ ] During Act 3B image generation, per-scene progress UI shows:
    - Scene index (e.g., "Illustrating page 5 of 12…")
    - Status icon: ⏳ working / ✅ done / ❌ failed / 🔄 retrying (anti-samey collision)
    - Thumbnail preview when image available
    - Optional: Estimated time remaining (based on avg generation time)
  - [ ] **"No dead waiting" policy**: ANY step taking >5 seconds shows visible progress + "What's happening" text
    - Language is non-technical and accomplishment-focused: "Making page 5 sparkle…" vs "Generating image 5/12"
  - [ ] No "silent waiting": every long step has visible progress + what's happening
  - [ ] Clear retry entry points (tie into TS-015)
- **Verification**: Manual test: import Part2 → start generation → watch checklist tick and per-scene progress update → simulate a failure and confirm status shows "failed" and can retry
- **Risk/Notes**:
  - Keep language non-technical (“Making page 3…” vs “Calling API…”)

---

### TS-020: Grand Unveiling Ceremony + Share Pack v1
- **Title**: Add a premium “Grand Unveiling” completion screen (Act III) + lightweight share pack
- **Priority**: P0
- **DependsOn**: TS-013, TS-014, TS-019
- **SpecRefs**: §8 Deliverables (final artifact experience)
- **FilesLikelyTouched**:
  - `components/BindBook.js`
  - `pages/viewer/[bookId].js` (or viewer load flow)
  - `components/viewer/` (optional unveiling components)
- **AcceptanceCriteria**:
  - [ ] **Grand Unveiling as Act 3D Accomplishment Landing Page**:
    - **Artifact Revealed**: Cover preview + Creator Certificate
    - **Badge Name**: "Book Published" (OPTIONAL icon: 🏆) (final badge)
    - **Premium Copy**: "You didn't just create a story. You built a world. Share it with pride." (or similar ceremonial message)
    - **Next Buttons**: "Open Your Book" (TS-014 viewer) + "Share Your Story"
  - [ ] After all images are generated and final bundle is ready, Act III shows a "Grand Unveiling" screen that is premium/ceremonial (tone shift: fewer jokes, more pride)
  - [ ] Screen displays all proof-of-work artifacts:
    - Hero Card (from TS-017)
    - Story Blueprint (from TS-018)
    - Production Checklist with all 8 badges green (from TS-019)
  - [ ] Unveiling screen includes:
    - cover preview
    - "Open Your Book" (loads the viewer with the final StoryState)
    - "Download Final Bundle" (existing TS-013 output)
    - "Creator Credits / Certificate" block:
      - "Created by: [user name or 'A Storyteller']"
      - "Published: [date in YYYY-MM-DD format]"
      - "Title: [story_title]"
      - Optional: "Mode: Premium Creator" badge if Premium mode was active
  - [ ] Share Pack v1 (lightweight, no ZIP required):
    - copyable "share blurb" text (1–2 sentences)
    - Share Pack v1 text dynamically includes badge count (e.g., "I just created a 12-page story and earned 8 creator badges with StorySmith!")
    - optional download of cover image if available (or at minimum, a clear viewer link)
  - [ ] The screen reinforces accomplishment via visible proof-of-work artifacts (Hero Card, Blueprint, Checklist state)
- **Verification**: Manual test: complete Act III → confirm Unveiling renders → "Open Your Book" works end-to-end in viewer → final bundle downloads → copy/share text works → responsive at ~360px width
- **Risk/Notes**:
  - Avoid manipulative upsells here; keep upgrade messaging secondary if present

---

### TS-021: Accomplishment Landing Page Pattern (Shared UI)
- **Title**: Implement reusable "Accomplishment Landing Page" pattern for all Macro Acts
- **Priority**: P1
- **DependsOn**: None (pattern task; specific Acts depend on this)
- **SpecRefs**: §8 Deliverables (presentation/readability), v4.0 Macro Act Structure
- **FilesLikelyTouched**:
  - `components/AccomplishmentLandingPage.js` (NEW: reusable component)
  - `lib/` (optional helper for badge display logic)
- **AcceptanceCriteria**:
  - [ ] Reusable component accepts props: `artifact` (JSX), `badgeName` (string), `premiumCopy` (string), `nextActions` (array of button configs)
  - [ ] Badge name displayed text-first (icons optional, passed via props)
  - [ ] Tone is premium/motivational (not juvenile/gimmicky)
  - [ ] Component responsive at ~360px width
  - [ ] Optional: micro-animations (subtle fade-ins, no confetti/explosions)
  - [ ] Per-Act implementations call this pattern (TS-017 for Act 1C, TS-018 for Act 2B, TS-020 for Act 3D)
- **Verification**: Manual test: component renders with sample props → badge displays correctly → responsive → animations subtle
- **Risk/Notes**:
  - Keep pattern flexible; each Act may have unique artifact requirements
  - This is a UI/UX task, not a data schema task

---

### TS-022: RNG/Variation Architecture (Seed + Anti-Samey Design)
- **Title**: Define and document RNG/variation architecture (variation knobs, seed capture, anti-samey safeguards)
- **Priority**: P1
- **DependsOn**: None (architecture/design task)
- **SpecRefs**: §6 Image Pipeline (variation quality), v4.0 Macro Act Structure
- **FilesLikelyTouched**:
  - `docs/specs/storysmith-rng-variation-architecture-v1.md` (NEW: architecture spec)
  - Or: subsection within this task map (if keeping docs-only lightweight)
- **AcceptanceCriteria**:
  - [ ] Document **Variation Knobs**:
    - `visual_style` (string): e.g., "watercolor", "ink sketch", "digital painting"
    - `visual_consistency_tag` (string): future integration for reference image uploads (Act 4 post-MVP)
    - Weighted pools/constraints: how to bias prompts based on style tags
  - [ ] Document **Seed/Replay Concept** (OPTIONAL, provider-agnostic):
    - If DALL-E 3 API supports seed parameter, capture and store in `illustration_metadata.seed`
    - If not, generate UUID for tracking/debugging purposes only
    - Seed replay: if user wants to regenerate "same" image, use stored seed (if supported)
  - [ ] Document **Anti-Samey Safeguards** (design + implementation contract):
    - Perceptual hash comparison (pHash/dHash) with 80% similarity threshold
    - Retry logic: if collision detected, increment seed (append `_retry_N`) up to 3 attempts
    - Fallback: accept final output if all retries fail (log event)
    - Policy: <10% collision rate acceptable for MVP
  - [ ] Implementation mapped to TS-011 (image loop), TS-015 (retry UI), TS-026 (test suite)
- **Verification**: Document reviewed; concepts align with TS-011 implementation; anti-samey test plan (TS-026) validates design
- **Risk/Notes**:
  - Provider-agnostic design: if switching from DALL-E 3 to Midjourney/Stable Diffusion, architecture should still apply
  - Seed replay is OPTIONAL (nice-to-have); anti-samey is REQUIRED (MVP)

---

### TS-023: Premium Question Pack — Hero Traits (100+ Questions)
- **Title**: Implement Premium Creator Mode question pack for hero trait capture (Act 1B, Station 2)
- **Priority**: P1
- **DependsOn**: TS-006
- **SpecRefs**: §3 Act I outputs (CharacterBlock depth), v4.0 Macro Act Structure (Station 2)
- **FilesLikelyTouched**:
  - `components/ForgeHero.js` (add Premium mode conditional UI)
  - `lib/questionPacks.js` (NEW: hierarchical hero question taxonomy)
  - `lib/storyState.js` (extend `metadata.premium_mode`, `metadata.hero_question_responses`)
- **AcceptanceCriteria**:
  - [ ] Premium mode toggle available (env var `PREMIUM_MODE=true` or in-app toggle)
  - [ ] **If Premium ON**, Act 1B (Station 2) shows modular question packs (~20–30 questions in progressive groups):
    - Personality Core (5 questions: introverted/extroverted, optimist/pessimist, etc.)
    - Flaws + Strengths (5 questions: greatest weakness, hidden strength, etc.)
    - Worldview + Beliefs (5 questions: what they value most, what they fear, etc.)
    - Wardrobe + Appearance (5 questions: signature outfit, distinguishing feature, etc.)
    - Signature Item + Quirks (5 questions: lucky charm, nervous habit, etc.)
  - [ ] **If Premium OFF**, Act 1B shows basic 5-prompt flow (name, 3 traits, flaw, goal)
  - [ ] Question responses stored in `StoryState.metadata.hero_question_responses: { q_id: "response_text" }`
  - [ ] Responses feed into `hero_description` generation prompt (Premium: richer context → higher fidelity output)
  - [ ] Part1 bundle export preserves Premium responses (bundle validator accepts but doesn't require these fields)
- **Verification**: Toggle Premium ON → complete Act 1B → export Part1 → confirm `hero_question_responses` has 20+ key-value pairs; compare LLM outputs (Premium vs Basic) → qualitative assessment of depth/richness
- **Risk/Notes**:
  - Defer CMS/authoring tool for question packs to post-MVP; hardcode initial taxonomy in `questionPacks.js`
  - **ASSUMPTION**: 20–30 hero questions produce meaningfully better `hero_description` than basic 5 prompts (VERIFY via blind user testing: 5+ testers rate Premium vs Basic outputs on 5-point quality scale)

---

### TS-024: Premium Question Pack — Story Intent (100+ Questions)
- **Title**: Implement Premium Creator Mode question pack for story intent capture (Act 2A, Station 4)
- **Priority**: P1
- **DependsOn**: TS-007, TS-023 (reuses storage pattern), TS-025
- **SpecRefs**: §3 Act II outputs (StoryBlueprintBlock depth), v4.0 Macro Act Structure (Station 4)
- **FilesLikelyTouched**:
  - `components/SpinTale.js` (add Premium mode conditional UI)
  - `lib/questionPacks.js` (add story question taxonomy)
  - `pages/api/scene-weaver.js` (extend blueprint generation prompt with Premium responses)
- **AcceptanceCriteria**:
  - [ ] **If Premium ON**, Act 2A (Station 4) shows modular question packs (~20–30 questions in progressive groups):
    - Theme + Moral (5 questions: central message, lesson learned, etc.)
    - Conflict Type (5 questions: internal vs external, man-vs-nature, etc.)
    - Pacing + Structure (5 questions: fast-paced action, slow-burn mystery, twist ending, etc.)
    - Tone + Mood (5 questions: whimsical, dark, hopeful, bittersweet, etc.)
    - Audience + Reading Level (5 questions: age range, complexity, etc.)
  - [ ] **If Premium OFF**, Act 2A shows single premise prompt (1 paragraph: "Describe your story idea")
  - [ ] Question responses stored in `StoryState.metadata.story_question_responses: { q_id: "response_text" }`
  - [ ] Responses feed into scene blueprint generation (LLM prompt includes Premium context for coherence + depth)
  - [ ] Part2 bundle export preserves Premium responses
  - [ ] TS-018 Story Blueprint displays differently:
    - **Premium**: Detailed beats per scene + explicit theme/moral statement
    - **Basic**: Minimal (logline + scene titles only)
- **Verification**: Premium ON → complete Act 2A → export Part2 → confirm `story_question_responses` has 20+ entries; Import Part2 into Act III → confirm Premium responses still accessible; Compare blueprint outputs (Premium vs Basic) → qualitative depth assessment
- **Risk/Notes**:
  - Defer adaptive question flow (conditional branching based on previous answers) to post-MVP
  - **ASSUMPTION**: 20–30 story intent questions produce meaningfully better scene blueprints (VERIFY via LLM output quality comparison: scene coherence, thematic consistency metrics)

---

### TS-025: Premium Question Response Storage Schema
- **Title**: Define and validate storage schema for Premium question responses (shared hero + story)
- **Priority**: P1
- **DependsOn**: TS-023
- **SpecRefs**: §5 Data Contracts (StoryState extensions)
- **FilesLikelyTouched**:
  - `lib/storyState.js` (extend schema)
  - `lib/bundleValidator.js` (add Premium field validation)
  - `lib/bundleImporter.js` (handle Premium fields during import)
  - `lib/bundleExporter.js` (ensure Premium fields exported)
- **AcceptanceCriteria**:
  - [ ] Schema extends `StoryState.metadata`:
    ```json
    {
      "metadata": {
        "premium_mode": true,
        "hero_question_responses": { "q_personality_1": "response text", ... },
        "story_question_responses": { "q_theme_1": "response text", ... }
      }
    }
    ```
  - [ ] Validator ensures:
    - If `premium_mode: true`, at least one of `hero_question_responses` or `story_question_responses` must be non-empty object
    - Response values are non-empty strings (trim whitespace, reject empty)
    - Question IDs follow naming convention: `q_[category]_[number]`
  - [ ] Import/export preserves Premium fields across all bundle types (Part1, Part2, Final)
  - [ ] Backward compatibility: bundles without Premium fields still validate (assume `premium_mode: false`)
  - [ ] Forward compatibility: future question pack expansions don't break validator (accept arbitrary question IDs)
- **Verification**: Export Part1 with Premium responses → import to Act II → confirm all responses persist; Export Part2 with Premium responses → import to Act III → confirm all responses persist; Validate bundle with missing Premium fields → confirm no errors (Basic mode assumed); Validate bundle with malformed Premium fields (empty string values) → confirm validation error with helpful message
- **Risk/Notes**:
  - None; straightforward schema extension
  - **ASSUMPTION**: localStorage + IndexedDB handle Premium question responses without hitting 5MB limit (VERIFY via stress test: create StoryState with 50+ question responses (~10KB text) + 12 image URLs (~500 bytes each) → confirm total size <2MB and localStorage write succeeds on Chrome/Firefox/Safari)

---

### TS-026: Anti-Samey Validation Test Suite
- **Title**: Create anti-samey validation test suite for image generation diversity
- **Priority**: P2
- **DependsOn**: TS-011, TS-022
- **SpecRefs**: §6 Image Pipeline (variation quality), v4.0 RNG/Variation Architecture
- **FilesLikelyTouched**:
  - `tests/anti-samey-validation.test.js` (NEW, test automation)
  - `docs/specs/anti-samey-test-plan.md` (NEW, policy doc)
- **AcceptanceCriteria**:
  - [ ] Test suite generates 10+ scene images using identical prompts with varied seeds
  - [ ] Validates visual diversity via:
    - **Automated**: Perceptual hash comparison (pHash/dHash) with <80% similarity threshold
    - **Manual**: Visual inspection protocol (blind comparison by 2+ reviewers)
  - [ ] Documents failure cases (e.g., "3 of 12 scenes had >80% hash similarity")
  - [ ] Test plan defines MVP acceptable threshold: "No more than 1 visually similar pair per 12 scenes"
  - [ ] Policy: If automated hash collision occurs during generation (TS-011), retry with incremented seed
- **Verification**: Run test suite on 3 sample books → confirm diversity meets threshold; Manual visual inspection validates hash threshold aligns with human perception
- **Risk/Notes**:
  - **ASSUMPTION**: Perceptual hash (80% threshold) is sufficient proxy for "samey" detection (VERIFY via manual inspection correlation study)
  - **ASSUMPTION**: <10% generation collision rate is acceptable for MVP (VERIFY via production metrics post-launch)

---

### TS-016: PDF Export (Post-MVP)
- **Title**: Implement PDF export functionality
- **Priority**: P2
- **DependsOn**: TS-002 (decision), TS-013
- **SpecRefs**: §8 Deliverables (PDF)
- **FilesLikelyTouched**:
  - `pages/api/generate-pdf.js` (NEW) or client-side component
  - `components/PdfExportButton.js` (NEW)
- **AcceptanceCriteria**:
  - [ ] Export button in viewer or Act III
  - [ ] PDF contains all pages with images
  - [ ] PDF is print-ready (correct dimensions)
- **Verification**: Generate PDF → Open in viewer → All pages correct
- **Risk/Notes**:
  - Deferred per TS-002 recommendation

---

## C) Task Dependency Graph

TS-001 (Persistence Decision)
    └── TS-004 (Export Util)
            └── TS-005 (Import Util)
                    └── TS-006 (Act I Export) ✅
                            ├── TS-017 (Hero Card + Progress Passport)
                            │       ├── depends on TS-023 (optional, for Premium mode Station 2)
                            │       └── [v4: expanded with Station 1–4 mapping + Accomplishment Landing Page]
                            ├── TS-023 (Premium Q Pack Hero)
                            │       └── TS-025 (Premium Storage Schema)
                            └── TS-007 (Act II Import) ✅
                                    ├── TS-024 (Premium Q Pack Story)
                                    │       ├── depends on TS-023 (reuses storage pattern)
                                    │       └── depends on TS-025
                                    └── TS-008 (Act II Prompts-Only) ✅
                                            └── TS-009 (Act II Export) ✅
                                                    ├── TS-018 (Story Blueprint)
                                                    │       ├── depends on TS-024 (optional, for Premium mode)
                                                    │       └── [v4: expanded with Accomplishment Landing Page + Premium mode display]
                                                    └── TS-010 (Act III Import) ✅
                                                            └── TS-011 (Act III Image Loop)
                                                                    │ [v4: expanded with seed capture + anti-samey + weighted pools + badge]
                                                                    ├── depends on TS-022 (RNG/Variation Architecture)
                                                                    ├── TS-012 (AssetsManifest)
                                                                    │       └── TS-013 (Final Export)
                                                                    │               └── TS-014 (Viewer Integration)
                                                                    │                       ├── TS-019 (Checklist + Progress)
                                                                    │                       │       └── [v4: expanded with 8 badges + per-scene progress UI]
                                                                    │                       └── TS-020 (Grand Unveiling)
                                                                    │                               └── [v4: expanded as Act 3D Accomplishment Landing Page]
                                                                    ├── TS-015 (Error Recovery)
                                                                    │       └── [v4: expanded with anti-samey retry logic]
                                                                    └── TS-026 (Anti-Samey Test Suite)
                                                                            └── depends on TS-022 (RNG Architecture)

TS-021 (Accomplishment Landing Page Pattern)
    └── No dependencies; pattern task used by TS-017, TS-018, TS-020

TS-022 (RNG/Variation Architecture)
    └── No dependencies; architecture task referenced by TS-011, TS-026

TS-002 (PDF Decision) → TS-016 (PDF Export)
TS-003 (PromptTree Decision) → [No dependent tasks in MVP]


---

## D) How to Run Tasks With AntiGravity

### Definition of Done
- **Manual Test Policy**: For any task requiring a "Manual Test" step:
  - If the manual test is NOT executed successfully, the task status MUST be "Blocked/Failing" and NOT "Complete".
  - "Complete" status requires successful verification of all acceptance criteria, including manual steps.

### User Message Format
```
Execute TS-0XX
```

### AntiGravity Response Format
1. **Plan**: Summary of changes to be made
2. **Files Changed**: List of created/modified paths
3. **Verification**: Commands run + results
4. **Paste-back Block**:
```
NEXT_TASK: TS-0YY — [Task Title]
```

### Example
```
User: Execute TS-004
AG: [Implements bundle export utility, runs verification, suggests TS-005]
```

---

## E) Summary

- **Total Tasks**: 26 (was 20 in v3.0)
- **P0 (Critical Path)**: 9 tasks (unchanged)
- **P1 (Important)**: 14 tasks (was 8; added TS-021, TS-022, TS-023, TS-024, TS-025)
- **P2 (Nice-to-have)**: 3 tasks (added TS-026)
- **Decision Tasks**: 3 (unchanged: TS-001, TS-002, TS-003)
- **Completed Tasks**: 10 (TS-001 through TS-010)
- **Incomplete Tasks**: 16 (TS-011 through TS-026, excluding TS-016 post-MVP)
- **New in v4.0**: 6 tasks (TS-021, TS-022, TS-023, TS-024, TS-025, TS-026)
- **Updated in v4.0**: 14 tasks (TS-006 through TS-015, TS-017 through TS-020 with v4 Addenda or expanded criteria)
- **Macro Acts Defined**: 10 (8 in MVP scope: 1A through 3D; 2 post-MVP placeholders)
- **Accomplishment Landing Pages**: 9 (one per MVP Macro Act, plus shared pattern task TS-021)
- **Estimated MVP Scope**: TS-001 through TS-026 (excluding TS-016 PDF post-MVP)

---

## F) Assumptions (v4.0)

All assumptions require exactly ONE verification step.

### ASSUMPTION 1: DALL-E 3 supports seed capture or deterministic replay
**Verification Step**: Review OpenAI DALL-E 3 API documentation for `seed` parameter in request/response; if unavailable, fallback to UUID-only tracking for debugging (TS-011, TS-022 implementation).

### ASSUMPTION 2: Perceptual hash comparison (80% similarity threshold) effectively detects "samey" images
**Verification Step**: Run TS-026 anti-samey test suite on 3 sample books with varied prompts → manual visual inspection by 2+ reviewers confirms hash threshold aligns with human perception of "too similar."

### ASSUMPTION 3: Premium 20–30 question packs produce meaningfully better outputs than basic 5-prompt flow
**Verification Step**: Generate 2 sample books (1 Basic, 1 Premium) with similar initial prompts → blind user testing with 5+ testers → collect ratings on 5-point quality scale (depth, richness, coherence) → Premium must score ≥1 point higher on average.

### ASSUMPTION 4: Users perceive badge/stamp UX as "premium" (not childish or gamification overload)
**Verification Step**: User testing with 3–5 alpha testers → collect feedback on badge tone/aesthetics using 5-point scale (1=childish, 5=premium) → target median score ≥4.

### ASSUMPTION 5: "No dead waiting" policy (visible progress for all >5sec steps) reduces user anxiety/drop-off
**Verification Step**: Post-MVP analytics: compare session abandon rate during Act 3B (image loop) before/after TS-019 implementation → target <10% abandon rate during image generation.

### ASSUMPTION 6: MVP can ship with 3-page stories (not 12-page minimum)
**Verification Step**: Confirm with stakeholder/user that 3-scene minimum is acceptable for MVP audience; if paid tier requires 12+ scenes, document as Premium gating rule in TS-008 v4 Addenda.

### ASSUMPTION 7: Share Pack v1 (copyable blurb + cover download) provides sufficient "shareable" value without social auto-post
**Verification Step**: Post-MVP user survey: "Did you share your story? If yes, which format? If no, what would help?" → validate Share Pack adoption rate ≥30% of completions.

### ASSUMPTION 8: localStorage + IndexedDB handle Premium question responses without hitting 5MB limit
**Verification Step**: Stress test: create StoryState with 50+ question responses (~10KB text) + 12 image URLs (~500 bytes each) → confirm total size <2MB and localStorage write succeeds on Chrome/Firefox/Safari.

### ASSUMPTION 9: Anti-samey retry rate <10% is acceptable for MVP (doesn't degrade UX)
**Verification Step**: Production metrics post-launch: track collision rate (images requiring retry) → target <10% per book; if >20%, revisit hash threshold or prompt variation strategy.