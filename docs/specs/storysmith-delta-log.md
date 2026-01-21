SpecName: StorySmith Delta Log
Version: v1.0
LastUpdated: 2026-01-20

# StorySmith Delta Log

Purpose: Track changes and redactions made to the StorySmith spec suite.

## Entry Template
- **Date**: YYYY-MM-DD
- **Change Summary**: Brief description
- **Spec IDs affected**: IDs
- **Repo paths affected**: Paths
- **Risk**: Low/Medium/High
- **Rollback**: How to revert

---

## [2026-01-20] Initial Redaction
- **Date**: 2026-01-20
- **Change Summary**: Initial creation of redacted specs from Stage 2 composite baseline source.
- **Spec IDs affected**: SS-BL-ACTI, SS-BL-CONTRACT, SS-BL-IMGPIPE, SS-BL-UNKNOWNS
- **Repo paths affected**: docs/specs/storysmith-composite-baseline-v3.0-redacted.md, docs/specs/storysmith-baseline-template-v3.0-redacted.md
- **Risk**: Low
- **Rollback**: Delete created files.

---

## [2026-01-21] Task Map Creation
- **Date**: 2026-01-21
- **Change Summary**: Created implementation task map (storysmith-task-map-v3.0.md) mapping canonical spec to codebase. No app code changed.
- **Spec IDs affected**: All (TS-001 through TS-016 defined)
- **Repo paths affected**: docs/specs/storysmith-task-map-v3.0.md (NEW)
- **Branch**: feature/html-book-viewer
- **Commit SHA**: 56a0e7d
- **Risk**: Low (documentation only)
- **Rollback**: Delete docs/specs/storysmith-task-map-v3.0.md

---

## [2026-01-21] TS-001 Decision: Persistence = localStorage
- **Date**: 2026-01-21
- **Change Summary**: Locked Q2 Open Unknown — Persistence Strategy. Decision: localStorage (browser-only) for MVP.
- **Spec IDs affected**: TS-001, §10 Q2
- **Repo paths affected**: docs/specs/storysmith-task-map-v3.0.md (updated TS-001)
- **Decision Details**:
  - **Choice**: (A) localStorage
  - **Why**: MVP speed, no auth/DB infrastructure required, reduces complexity
  - **Scope**: Viewer and act flows store StoryState locally per book/session_id
  - **Risks**: Clearing storage loses progress; no cross-device resume
  - **Follow-up**: Revisit when shipping multi-device resume (Phase 5)
- **Risk**: Low (documentation only)
- **Rollback**: Revert TS-001 section in task map

---

## [2026-01-21] Bundle Handoff Plan Drafted
- **Date**: 2026-01-21
- **Change Summary**: Created bundle handoff implementation plan covering export/import for Acts I→II→III.
- **Spec IDs affected**: TS-004, TS-005, TS-006, TS-007, TS-009, TS-010, TS-013
- **Repo paths affected**:
  - docs/specs/storysmith-bundle-handoff-plan-v3.0.md (NEW)
  - docs/specs/storysmith-task-map-v3.0.md (updated TS-004, TS-005 with plan references)
- **Plan Contents**:
  - JSON envelope structures for Part1, Part2, Final bundles
  - Validation rules and required fields per bundle type
  - Error messaging UX specifications
  - UI touchpoints (export buttons, import zones)
  - File paths for implementation utilities
- **Risk**: Low (documentation only, no code changes)
- **Rollback**: Delete handoff plan file, revert task map changes
