# Decision Record: TS-002 PDF Export Strategy

| Field | Value |
|-------|-------|
| **ID** | TS-002 |
| **Title** | PDF Export Strategy |
| **Date** | 2026-01-21 |
| **Owner** | MYMGG/StorySmith |
| **Status** | DECIDED |

---

## Decision

**Option C: Defer to post-MVP**

PDF export functionality will not be included in the MVP release. The HTML e-book viewer serves as the primary "readable book" deliverable. PDF generation will be revisited after core MVP features are stable.

---

## Alternatives Considered

| Option | Description | Verdict |
|--------|-------------|---------|
| **(A) Client-side @react-pdf/renderer** | Generate PDF in browser using React components | Rejected — bundle size concerns, layout limitations |
| **(B) Server-side Puppeteer** | Render HTML pages server-side and export to PDF | Rejected — requires infrastructure changes |
| **(C) Defer to post-MVP** | Focus on HTML viewer; add PDF later | **Chosen** |

---

## Trade-offs

### Option A: Client-side @react-pdf/renderer
| Pros | Cons |
|------|------|
| No server dependency | Large bundle size (~500KB+) |
| Instant generation | Limited CSS support |
| Works offline | Complex layout recreation required |
| | Font embedding challenges |

### Option B: Server-side Puppeteer
| Pros | Cons |
|------|------|
| Full CSS/layout fidelity | Requires server infrastructure |
| Uses existing HTML viewer | Cold start latency |
| Print-quality output | Hosting cost for Puppeteer |
| | Security considerations |

### Option C: Defer (Chosen)
| Pros | Cons |
|------|------|
| Faster MVP delivery | No PDF in initial release |
| Reduces complexity | Users must use HTML viewer |
| HTML viewer satisfies core requirement | May disappoint print-focused users |
| Can choose best approach later | |

---

## Rationale

1. **MVP timeline priority**: PDF adds ~1-2 weeks of implementation time with uncertain scope.
2. **HTML viewer is sufficient**: TS-014 delivers a fully functional e-book reading experience.
3. **Infrastructure simplicity**: Avoiding Puppeteer keeps deployment simple (Vercel-compatible).
4. **Bundle size concerns**: @react-pdf/renderer significantly increases client bundle.
5. **Layout complexity**: Recreating page layouts in PDF format requires significant effort.
6. **Better data post-MVP**: After TS-013/TS-014, we'll have stable StoryState contracts to build PDF on.

---

## Scope (MVP)

- **TS-016 (PDF Export)**: Remains in task map as post-MVP (P2)
- **Deliverable format**: HTML e-book only
- **Print workaround**: Users can use browser "Print to PDF" if needed

---

## Revisit Trigger

Re-evaluate this decision when:

1. TS-013 (Final Bundle Export) is complete and stable
2. TS-014 (Viewer Integration) is complete and stable
3. User feedback indicates strong PDF demand
4. Team has bandwidth for infrastructure expansion (if choosing Option B)

---

## Related

- **Spec Refs**: §10 Open Questions Q3, §8 Deliverables
- **Dependent Task**: TS-016 (PDF Export) blocked until this revisit
- **Task Map**: TS-002 in `docs/specs/storysmith-task-map-v3.0.md`
- **Delta Log**: Entry in `docs/specs/storysmith-delta-log.md`
