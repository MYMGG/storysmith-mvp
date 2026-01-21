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

### TS-002: DECISION — PDF Export Strategy
- **Title**: Decide PDF generation approach
- **Priority**: P1
- **DependsOn**: None
- **SpecRefs**: §10 Open Questions Q3, §8 Deliverables
- **FilesLikelyTouched**: docs/specs/ (decision record only)
- **AcceptanceCriteria**:
  - [ ] Document chosen option: (A) client-side @react-pdf/renderer, (B) server-side Puppeteer, (C) defer to post-MVP
  - [ ] Record trade-offs
  - [ ] Update delta log with decision
- **Verification**: Review decision document
- **Risk/Notes**:
  - Server-side requires infra changes
  - Recommend: (C) defer to post-MVP for faster shipping

---

### TS-003: DECISION — PromptTree Integration
- **Title**: Decide PromptTree usage stance
- **Priority**: P2
- **DependsOn**: None
- **SpecRefs**: §7 PromptTree, §10 Open Questions Q4
- **FilesLikelyTouched**: docs/specs/ (decision record only)
- **AcceptanceCriteria**:
  - [ ] Document chosen option: (A) replace templates, (B) translate to templates, (C) stress-test only
  - [ ] Record rationale
  - [ ] Update delta log with decision
- **Verification**: Review decision document
- **Risk/Notes**:
  - Current implementation uses plain-text templates
  - Recommend: (C) stress-test only for MVP

---

### TS-004: Implement Bundle Export Utility
- **Title**: Create reusable bundle export function
- **Priority**: P0
- **DependsOn**: TS-001
- **SpecRefs**: §3 Act Flows (outputs), §8 Deliverables
- **DetailedPlan**: See `docs/specs/storysmith-bundle-handoff-plan-v3.0.md` §1, §4.1
- **FilesLikelyTouched**:
  - `lib/bundleExporter.js` (NEW)
  - `lib/storyState.js` (extend if needed)
- **AcceptanceCriteria**:
  - [ ] `exportBundle(storyState, bundleType)` returns downloadable JSON
  - [ ] Supports Part1, Part2, Final bundle types
  - [ ] Uses canonical `StoryState` wrapper format per handoff plan
  - [ ] Filename matches spec: `MyHeroAssetBundle_Part1.json`, etc.
- **Verification**: `npm run build` passes; exported JSON matches handoff plan schema
- **Risk/Notes**:
  - Foundation for all handoff tasks

---

### TS-005: Implement Bundle Import Utility
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
  - [ ] `importBundle(file)` parses and validates JSON
  - [ ] Returns normalized `StoryState` via `normalizeToStoryState()`
  - [ ] Handles `SessionState` alias mapping
  - [ ] Rejects invalid bundles with error messages per handoff plan §2.3
- **Verification**: `npm run build` passes; import rejects invalid bundles correctly
- **Verification**: `npm run build` passes; unit test imports sample bundle
- **Risk/Notes**:
  - Must handle legacy formats gracefully

---

### TS-006: Add Export Button to ForgeHero (Act I)
- **Title**: Add "Export Hero Bundle" UI to Act I
- **Priority**: P0
- **DependsOn**: TS-004
- **SpecRefs**: §3 Act I outputs
- **FilesLikelyTouched**:
  - `components/ForgeHero.js`
- **AcceptanceCriteria**:
  - [ ] Button visible after hero creation complete
  - [ ] Downloads `MyHeroAssetBundle_Part1.json`
  - [ ] Bundle contains `StoryState` with `CharacterBlock` populated
  - [ ] Bundle passes `isValidStoryState()` check
- **Verification**: Complete Act I flow; verify downloaded JSON structure
- **Risk/Notes**:
  - Requires state tracking for "hero complete" status

---

### TS-007: Add Import UI to SpinTale (Act II)
- **Title**: Add "Import Hero Bundle" UI to Act II
- **Priority**: P0
- **DependsOn**: TS-005, TS-006
- **SpecRefs**: §3 Act II inputs
- **FilesLikelyTouched**:
  - `components/SpinTale.js`
- **AcceptanceCriteria**:
  - [ ] File upload input on Act II start
  - [ ] Validates uploaded bundle
  - [ ] Populates StoryState with `CharacterBlock` from bundle
  - [ ] Shows error for invalid bundles
- **Verification**: Export from Act I → Import to Act II → Hero data visible
- **Risk/Notes**:
  - UX: consider drag-drop support

---

### TS-008: Enforce Act II Prompts-Only Pipeline
- **Title**: Ensure Act II stores illustration_prompt without generating images
- **Priority**: P1
- **DependsOn**: TS-007
- **SpecRefs**: §6 Image Pipeline
- **FilesLikelyTouched**:
  - `pages/api/scene-weaver.js`
  - `components/SpinTale.js`
- **AcceptanceCriteria**:
  - [ ] Scene approval stores `illustration_prompt` in `SceneJSON_array[i]`
  - [ ] `scene_status` set to `pending_illustration`
  - [ ] NO image generation calls in Act II
  - [ ] `illustration_url` remains null/empty
- **Verification**: Complete scene in Act II; verify exported bundle has prompts but no URLs
- **Risk/Notes**:
  - May require removing existing image generation calls

---

### TS-009: Add Export Button to SpinTale (Act II)
- **Title**: Add "Export Story Bundle" UI to Act II
- **Priority**: P0
- **DependsOn**: TS-008
- **SpecRefs**: §3 Act II outputs
- **FilesLikelyTouched**:
  - `components/SpinTale.js`
- **AcceptanceCriteria**:
  - [ ] Button visible after all scenes approved
  - [ ] Downloads `MyStoryAssetBundle_Part2.json`
  - [ ] Bundle contains `SceneJSON_array` with prompts
  - [ ] Bundle contains `cover_image_prompt`
- **Verification**: Complete Act II flow; verify downloaded JSON structure
- **Risk/Notes**:
  - Requires tracking "all scenes complete" status

---

### TS-010: Add Import UI to BindBook (Act III)
- **Title**: Add "Import Story Bundle" UI to Act III
- **Priority**: P0
- **DependsOn**: TS-009
- **SpecRefs**: §3 Act III inputs
- **FilesLikelyTouched**:
  - `components/BindBook.js`
- **AcceptanceCriteria**:
  - [ ] File upload input on Act III start
  - [ ] Validates uploaded Part2 bundle
  - [ ] Populates StoryState with scenes/prompts from bundle
  - [ ] Shows error for invalid bundles
- **Verification**: Export from Act II → Import to Act III → Scenes/prompts visible
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

```
TS-001 (Persistence Decision)
    └── TS-004 (Export Util)
            └── TS-005 (Import Util)
                    └── TS-006 (Act I Export)
                            └── TS-007 (Act II Import)
                                    └── TS-008 (Act II Prompts-Only)
                                            └── TS-009 (Act II Export)
                                                    └── TS-010 (Act III Import)
                                                            └── TS-011 (Act III Image Loop)
                                                                    └── TS-012 (AssetsManifest)
                                                                            └── TS-013 (Final Export)
                                                                                    └── TS-014 (Viewer Integration)
                                                                                            └── TS-015 (Error Recovery)

TS-002 (PDF Decision) → TS-016 (PDF Export)
TS-003 (PromptTree Decision) → [No dependent tasks in MVP]
```

---

## D) How to Run Tasks With AntiGravity

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

- **Total Tasks**: 16
- **P0 (Critical Path)**: 8 tasks
- **P1 (Important)**: 5 tasks
- **P2 (Nice-to-have)**: 3 tasks
- **Decision Tasks**: 3
- **Estimated MVP Scope**: TS-001 through TS-014 (excluding TS-016 PDF)
