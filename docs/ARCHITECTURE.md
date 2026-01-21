# StorySmith Architecture

This document provides a high-level overview of the StorySmith MVP codebase.

---

## System Overview

StorySmith is a multi-act children's storybook creation platform.

| Act | Purpose | API Route | UI Component |
| :--- | :--- | :--- | :--- |
| **I (ForgeHero)** | Create hero character | [`pages/api/forge-hero.js`](../pages/api/forge-hero.js) | [`components/ForgeHero.js`](../components/ForgeHero.js) |
| **II (SpinTale)** | Generate story scenes + prompts | [`pages/api/scene-weaver.js`](../pages/api/scene-weaver.js) | [`components/SpinTale.js`](../components/SpinTale.js) |
| **III (BindBook)** | Generate images, assemble book | [`pages/api/bind-book.js`](../pages/api/bind-book.js) | [`components/BindBook.js`](../components/BindBook.js) |

**Viewer**: [`pages/viewer/[bookId].js`](../pages/viewer/[bookId].js) + [`components/viewer/`](../components/viewer/)

---

## Directory Responsibilities

| Path | Purpose |
| :--- | :--- |
| `components/` | React UI components (acts + viewer) |
| `pages/api/` | Next.js API routes (LLM/image generation) |
| `lib/` | Shared utilities: `storyState.js`, `bundleExporter.js`, `bundleImporter.js`, `bundleValidator.js` |
| `hooks/` | Custom React hooks (`useBookState.js`) |
| `docs/specs/` | Canonical specs and decision records |
| `.agent/` | Workspace rules + workflows |

---

## Data Contracts

**StoryState** is the canonical data envelope for a single book. Schema lives in:

- [`lib/storyState.js`](../lib/storyState.js)
- [`docs/specs/storysmith-bundle-handoff-plan-v3.0.md`](specs/storysmith-bundle-handoff-plan-v3.0.md)

Key blocks: `CharacterBlock`, `SceneJSON_array`, `Cover`, `AssetsManifest`.

**SessionState** is an alias; use `normalizeToStoryState()` in `bundleImporter.js`.

---

## Current Constraints (MVP)

1. **Act II prompts-only**: Scene approval stores `illustration_prompt` but does NOT generate images.
2. **Act III image loop**: Not yet implemented; images are generated only in Act III.
3. **Persistence**: localStorage + IndexedDB (browser-only); no server-side DB.
4. **PDF export**: Deferred to post-MVP; HTML viewer is the primary deliverable.

---

## Where to Add New Work

Consult the **Task Map**: [`docs/specs/storysmith-task-map-v3.0.md`](specs/storysmith-task-map-v3.0.md)

- Use the `TS-0XX` identifier to locate task details.
- Respect dependency graph (Section C).
- Tasks marked `[x] COMPLETE` should not be reopened without reason.

---

## "Do Not Violate" Rules

> Defined in [`.agent/rules/storysmith.md`](../.agent/rules/storysmith.md)

1. **Scope**: Only read/write inside the repo root. Never modify home-dir or system files.
2. **Secrets**: Never print, paste, log, or hardcode API keys/tokens; use env patterns.
3. **Git**: Never commit unless asked; produce diff summaries after edits.
4. **Quality**: Diagnose → Patch → Verify loop; one fix attempt, then ask user.
5. **Minimal diffs**: Avoid broad refactors; never change unrelated formatting.
