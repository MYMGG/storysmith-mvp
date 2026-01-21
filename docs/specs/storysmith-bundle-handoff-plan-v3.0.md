SpecName: StorySmith Bundle Handoff Plan
Version: v3.0
GeneratedAt: 2026-01-21T10:41:00-05:00
Branch: feature/html-book-viewer
Safety: REDACTED_repo_safe — no proprietary prompts included
RelatedTasks: TS-004, TS-005, TS-006, TS-007, TS-009, TS-010, TS-013

# StorySmith Bundle Handoff Implementation Plan (v3.0)

This document specifies the export/import contract for StoryState bundles passed between Acts I → II → III per the canonical baseline spec §3 and §8.

---

## 1) Export Artifacts

### 1.1 MyHeroAssetBundle_Part1.json (Act I → Act II)

**Produced by**: Act I (ForgeHero component)
**Consumed by**: Act II (SpinTale component)

**JSON Envelope Structure**:
```json
{
  "bundleType": "Part1",
  "bundleVersion": "1.0",
  "exportedAt": "2026-01-21T10:00:00Z",
  "StoryState": {
    "version": 1,
    "metadata": {
      "session_id": "ss_xxx_yyy",
      "last_updated": 1737450000000,
      "last_prompt": null
    },
    "story_data": {
      "story_title": "My Hero Story",
      "thematic_tone": null,
      "visual_style": null,
      "visual_consistency_tag": null
    },
    "story_content": {
      "CharacterBlock": {
        "hero_name": "...",
        "hero_description": "...",
        "hero_image_url": "...",
        "hero_image_prompt": "...",
        "traits": {}
      },
      "StoryBlueprintBlock": null,
      "SceneJSON_array": [],
      "Cover": null,
      "AssetsManifest": null
    }
  }
}
```

**Required Fields for Validation**:
- `bundleType` === "Part1"
- `StoryState.story_content.CharacterBlock` !== null
- `StoryState.story_content.CharacterBlock.hero_name` !== null

---

### 1.2 MyStoryAssetBundle_Part2.json (Act II → Act III)

**Produced by**: Act II (SpinTale component)
**Consumed by**: Act III (BindBook component)

**JSON Envelope Structure**:
```json
{
  "bundleType": "Part2",
  "bundleVersion": "1.0",
  "exportedAt": "2026-01-21T12:00:00Z",
  "StoryState": {
    "version": 1,
    "metadata": { ... },
    "story_data": { ... },
    "story_content": {
      "CharacterBlock": { ... },
      "StoryBlueprintBlock": { ... },
      "SceneJSON_array": [
        {
          "scene_id": "scene_1",
          "scene_title": "Chapter 1",
          "scene_status": "pending_illustration",
          "scene_full_text": "...",
          "illustration_prompt": "...",
          "illustration_url": null,
          "continuity_notes": null
        }
      ],
      "Cover": {
        "cover_image_url": null,
        "cover_image_prompt": "...",
        "cover_title": "..."
      },
      "AssetsManifest": null
    }
  }
}
```

**Required Fields for Validation**:
- `bundleType` === "Part2"
- `StoryState.story_content.CharacterBlock` !== null
- `StoryState.story_content.SceneJSON_array.length` > 0
- Each scene has `illustration_prompt` !== null
- `StoryState.story_content.Cover.cover_image_prompt` !== null

---

## 2) Import Rules

### 2.1 Schema Validation

| Field | Part1 Required | Part2 Required | Final Required |
| :--- | :--- | :--- | :--- |
| `bundleType` | ✅ "Part1" | ✅ "Part2" | ✅ "Final" |
| `bundleVersion` | ✅ | ✅ | ✅ |
| `StoryState` | ✅ | ✅ | ✅ |
| `CharacterBlock` | ✅ | ✅ | ✅ |
| `SceneJSON_array` | ❌ (empty) | ✅ (length > 0) | ✅ (with URLs) |
| `illustration_prompt` (per scene) | N/A | ✅ | ✅ |
| `illustration_url` (per scene) | N/A | ❌ (null) | ✅ (populated) |
| `Cover.cover_image_prompt` | N/A | ✅ | ✅ |
| `Cover.cover_image_url` | N/A | ❌ (null) | ✅ (populated) |
| `AssetsManifest` | ❌ | ❌ | ✅ (complete) |

### 2.2 Backward Compatibility Strategy

**Migration Path**:
1. Check for `bundleVersion` field
2. If missing, assume version "0.9" (legacy) and apply migration
3. Use `normalizeToStoryState()` from `lib/storyState.js` to handle:
   - Legacy flat schema → canonical envelope
   - `SessionState` alias → `StoryState` wrapper
4. Log migration actions to console for debugging

**Version Handling**:
```javascript
// Pseudocode
if (!bundle.bundleVersion) {
  bundle = migrateLegacyBundle(bundle);
}
if (bundle.bundleVersion === "0.9") {
  bundle = migrateV09toV10(bundle);
}
const storyState = normalizeToStoryState(bundle.StoryState);
```

### 2.3 Error Messaging UX

| Error Condition | User-Facing Message |
| :--- | :--- |
| File not JSON | "Invalid file format. Please upload a .json file." |
| Missing `bundleType` | "This doesn't appear to be a StorySmith bundle." |
| Wrong `bundleType` for act | "This is a Part2 bundle. Act II requires a Part1 bundle." |
| Missing `CharacterBlock` | "This bundle is missing hero data. Please complete Act I first." |
| Missing scenes (Part2) | "This bundle has no scenes. Please complete Act II first." |
| Missing prompts (Part2) | "Scene {N} is missing an illustration prompt." |

**UI Behavior**:
- Show error in a dismissible toast or inline alert
- Highlight the upload area in red
- Clear file input after error
- Offer "Try Again" or "Learn More" actions

---

## 3) UI Touchpoints

### 3.1 Export Buttons

| Act | Component | Button Location | Trigger Condition |
| :--- | :--- | :--- | :--- |
| Act I | `components/ForgeHero.js` | Bottom of completion screen | Hero portrait generated |
| Act II | `components/SpinTale.js` | Bottom after all scenes approved | All scenes status = "approved" |
| Act III | `components/BindBook.js` | Bottom after all images generated | All scenes have `illustration_url` |

**Button Styling**:
- Primary action button (amber/gold theme)
- Icon: download arrow
- Text: "Download Hero Bundle" / "Download Story Bundle" / "Download Final Book"

### 3.2 Import UI

| Act | Component | Import Location | UX Flow |
| :--- | :--- | :--- | :--- |
| Act II | `components/SpinTale.js` | Initial screen before scene creation | Step 1 before proceeding |
| Act III | `components/BindBook.js` | Initial screen before binding | Step 1 before proceeding |

**Import UX Flow**:
1. User sees "Upload your bundle to continue" prompt
2. Drag-drop zone OR "Browse files" button
3. File selected → validate → show preview summary
4. If valid: "Continue" button becomes active
5. If invalid: show error, clear selection, allow retry

### 3.3 Minimal Flow Diagrams

**Act I → Act II Handoff**:
```
[Act I Complete] → [Click "Download Hero Bundle"] → [Part1.json saved]
     ↓
[Open Act II] → [Upload Part1.json] → [Validate] → [Load CharacterBlock] → [Begin scene creation]
```

**Act II → Act III Handoff**:
```
[Act II Complete] → [Click "Download Story Bundle"] → [Part2.json saved]
     ↓
[Open Act III] → [Upload Part2.json] → [Validate] → [Load scenes/prompts] → [Begin image generation]
```

---

## 4) File Paths & Implementation

### 4.1 New Utility Files

| File | Purpose |
| :--- | :--- |
| `lib/bundleExporter.js` | `exportBundle(storyState, bundleType)` → triggers download |
| `lib/bundleImporter.js` | `importBundle(file)` → validates and returns StoryState |
| `lib/bundleValidator.js` | `validateBundle(bundle, expectedType)` → returns `{valid, errors}` |

### 4.2 Component Modifications

| Component | Changes |
| :--- | :--- |
| `components/ForgeHero.js` | Add "Download Hero Bundle" button + state check |
| `components/SpinTale.js` | Add import UI on start + export button on complete |
| `components/BindBook.js` | Add import UI on start + export button on complete |

### 4.3 No API Changes Required

All export/import happens client-side. No new API routes needed for this phase.

---

## 5) Acceptance Criteria

### 5.1 For This Planning Document (TS-002-ish scope)

- [x] JSON envelope structure documented for Part1 and Part2
- [x] Required fields for validation specified
- [x] Backward compatibility strategy defined
- [x] Error messages for user documented
- [x] UI touchpoints identified per component
- [x] File paths for implementation listed
- [x] No proprietary prompt IP included

### 5.2 For Future Implementation (TS-004 through TS-010)

| Task | Acceptance Criteria Summary |
| :--- | :--- |
| TS-004 | `exportBundle()` produces valid JSON, triggers download |
| TS-005 | `importBundle()` parses, validates, normalizes |
| TS-006 | ForgeHero has working export button |
| TS-007 | SpinTale has working import UI |
| TS-009 | SpinTale has working export button |
| TS-010 | BindBook has working import UI |
| TS-013 | BindBook has working final export button |

---

## 6) Verification Steps (Docs-Only)

### 6.1 Repo Check
```bash
git diff --stat
# Should show only docs/specs/ files modified
```

### 6.2 Forbidden-String Scan
Scan all `.md` files in `docs/specs/` for proprietary terms (persona names, mode switching syntax, tool invocation markers, kernel headers).

**Scan command**:
```bash
grep -riE "(persona|role|mode.*switch|invoke.*syntax)" docs/specs/*.md
```

Expected result: **CLEAN (0 hits for proprietary IP)**

---

## 7) Summary

This plan defines the contract for bundle handoffs between acts without touching any application code. Implementation will proceed in TS-004 → TS-005 → TS-006 → TS-007 → TS-009 → TS-010 → TS-013 order per the task map dependency graph.
