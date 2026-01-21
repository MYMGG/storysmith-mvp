# Decision Record: TS-003 PromptTree Integration

| Field | Value |
|-------|-------|
| **ID** | TS-003 |
| **Title** | PromptTree Integration Strategy |
| **Date** | 2026-01-21 |
| **Owner** | MYMGG/StorySmith |
| **Status** | DECIDED |

---

## Decision

**Option C: Stress-test only for MVP**

PromptTree will be used exclusively as a QA/stress-test harness during the MVP phase. Production prompt construction will continue to use the existing plain-text template system.

---

## Alternatives Considered

| Option | Description | Verdict |
|--------|-------------|---------|
| **(A) Replace templates** | Fully migrate production prompts to PromptTree-based assembly | Rejected — too risky for MVP timeline |
| **(B) Translate to templates** | Use PromptTree to generate template strings at build time | Rejected — adds build complexity without clear benefit |
| **(C) Stress-test only** | Keep templates; use PromptTree as constraint/stress-test harness | **Chosen** |

---

## Rationale

1. **Reduce implementation risk**: MVP timeline is tight; changing prompt construction mechanics introduces unnecessary risk.
2. **Templates are stable**: Current plain-text template system (`lib/prompts/`) is working and well-understood.
3. **PromptTree adds value as QA tool**: Can validate that templates satisfy all narrative constraints without being in the production path.
4. **Defer complexity**: Translation/replacement efforts should wait until post-MVP when contracts and bundle handoff patterns have stabilized.
5. **No runtime dependency**: Keeps deployment simple; PromptTree is dev/test-time only.
6. **Clear revisit trigger**: Decision can be revisited once TS-002 bundle handoff and StoryState contracts are complete and proven.

---

## Scope (MVP)

- **Runtime**: No PromptTree dependency in production code
- **Build-time**: No PromptTree-generated artifacts in production bundle
- **Dev/Test**: PromptTree available as optional stress-test harness
- **Prompt source of truth**: Plain-text templates in `lib/prompts/`

---

## Revisit Trigger

Re-evaluate this decision when:

1. TS-002 bundle handoff implementation is complete and stable
2. Canonical StoryState contracts are finalized and in use across all acts
3. Team has bandwidth for prompt infrastructure improvements
4. Evidence suggests templates are becoming maintenance burden

---

## Related

- **Spec Refs**: §7 PromptTree, §10 Open Questions Q4
- **Task Map**: TS-003 in `docs/specs/storysmith-task-map-v3.0.md`
- **Delta Log**: Entry in `docs/specs/storysmith-delta-log.md`
