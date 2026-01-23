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
- **Verification**: Import Part2 bundle → Trigger generation → All scenes have URLs
- **Risk/Notes**:
  - Rate limiting/error handling needed
  - Consider progress UI

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
- **Verification**: Verify final StoryState JSON contains complete AssetsManifest
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
- **Verification**: Complete Act III flow; verify downloaded JSON is complete
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
- **Verification**: Simulate API failure → Retry → Operation succeeds
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
  - [ ] After hero creation completes, UI shows a “Hero Card” panel that looks collectible and premium (not childish):
    - hero name + tagline
    - 3 defining traits
    - 1 flaw/weakness
    - 1 goal
    - hero portrait (or tasteful placeholder if none)
  - [ ] Hero Card content is derived from existing `CharacterBlock` fields (avoid new schema fields unless strictly necessary)
  - [ ] Add a compact “Progress Passport” indicator for Act I (e.g., Station 1–4) that visibly stamps completed steps
  - [ ] Existing export flow remains intact (`MyHeroAssetBundle_Part1.json`)
- **Verification**: Manual test: complete Act I → confirm Hero Card + Passport stamps render → export still downloads and validates → check responsive at ~360px width
- **Risk/Notes**:
  - Keep micro-animations subtle; avoid confetti/“kiddy” effects

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
  - [ ] After Act II completion, show a “Story Blueprint” section that makes the work feel earned:
    - 1-paragraph premise/logline
    - numbered scene list (title + 1-sentence beat each)
    - optional: theme/moral line (single sentence)
  - [ ] Blueprint is deterministic from `StoryState` (prefer derive-on-demand over schema changes)
  - [ ] Blueprint is available to display later when the final bundle is viewed (viewer reads StoryState and can render the Blueprint)
- **Verification**: Manual test: complete Act II → Blueprint displays → export Part2 bundle → later import through Act III and load final in viewer → Blueprint can be shown from StoryState-derived data
- **Risk/Notes**:
  - Avoid long text walls; blueprint is a “map,” not the full manuscript

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
  - [ ] Show a “Production Checklist” that updates as the user progresses:
    - Hero ✅
    - Story Scenes ✅
    - Illustration Prompts ✅
    - Illustrations (n/N) during Act III
    - Export ✅ when final bundle is ready
  - [ ] During Act III image generation, UI shows:
    - current scene index (e.g., 3/12)
    - status per scene (pending/working/done/failed)
    - clear retry entry points (tie into TS-015)
  - [ ] No “silent waiting”: every long step has visible progress + what’s happening
- **Verification**: Manual test: import Part2 → start generation → watch checklist tick and per-scene progress update → simulate a failure and confirm status shows “failed” and can retry
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
  - [ ] After all images are generated and final bundle is ready, Act III shows a “Grand Unveiling” screen that is premium/ceremonial (tone shift: fewer jokes, more pride)
  - [ ] Unveiling screen includes:
    - cover preview
    - “Open Your Book” (loads the viewer with the final StoryState)
    - “Download Final Bundle” (existing TS-013 output)
    - “Creator Credits / Certificate” block (Created for: ___, Date, Title)
  - [ ] Share Pack v1 (lightweight, no ZIP required):
    - copyable “share blurb” text (1–2 sentences)
    - optional download of cover image if available (or at minimum, a clear viewer link)
  - [ ] The screen reinforces accomplishment via visible proof-of-work artifacts (Hero Card, Blueprint, Checklist state)
- **Verification**: Manual test: complete Act III → confirm Unveiling renders → “Open Your Book” works end-to-end in viewer → final bundle downloads → copy/share text works → responsive at ~360px width
- **Risk/Notes**:
  - Avoid manipulative upsells here; keep upgrade messaging secondary if present

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
                    └── TS-006 (Act I Export)
                            ├── TS-017 (Hero Card + Progress Passport)
                            └── TS-007 (Act II Import)
                                    └── TS-008 (Act II Prompts-Only)
                                            └── TS-009 (Act II Export)
                                                    ├── TS-018 (Story Blueprint)
                                                    └── TS-010 (Act III Import)
                                                            └── TS-011 (Act III Image Loop)
                                                                    ├── TS-012 (AssetsManifest)
                                                                    │       └── TS-013 (Final Export)
                                                                    │               └── TS-014 (Viewer Integration)
                                                                    │                       ├── TS-019 (Checklist + Progress)
                                                                    │                       └── TS-020 (Grand Unveiling)
                                                                    └── TS-015 (Error Recovery)

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

- **Total Tasks**: 20
- **P0 (Critical Path)**: 9 tasks
- **P1 (Important)**: 8 tasks
- **P2 (Nice-to-have)**: 3 tasks
- **Decision Tasks**: 3
- **Estimated MVP Scope**: TS-001 through TS-015 plus TS-017 through TS-020 (excluding TS-016 PDF)
