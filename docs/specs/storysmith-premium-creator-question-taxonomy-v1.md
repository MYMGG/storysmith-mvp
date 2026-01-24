# StorySmith Premium Creator Question Taxonomy (v1)

## Philosophy
Basic Mode = ~5 questions. (Curated, safe, fast).
Premium Creator Mode = ~20-100 questions. (Deep, granular, specific).

## Hierarchy

### Level 1: Master Headers (The "Packs")
1.  **Origin** (The Hero's past)
2.  **Psychology** (The Hero's mind)
3.  **Physiology** (The Hero's body)
4.  **Sociology** (The Hero's world)
5.  **Teleology** (The Hero's goal)

### Level 2: Subheaders (The "Chapters")
*   *Under "Psychology":*
    *   Fears & Phobias
    *   Habits & Tics
    *   Moral Alignment
    *   Defense Mechanisms

### Level 3: Question Modules (The "Interactions")
*   **Binary Toggle:** "Introvert vs Extrovert"
*   **Slider:** "Bravery: Coward <---> Fearless"
*   **Multiple Choice:** "Favorite Food?"
*   **Free Text:** "What is their deepest secret?"

## Implementation Strategy
*   **Question Packs:** JSON arrays loaded dynamically.
*   **Progressive Disclosure:** Don't show all 100. Show "Psychology" pack. User opens it, fills 3 key items, others are optional.
*   **"Feeling Lucky":** Button to RNG fill an entire pack.

## Basic vs Premium
| Feature | Basic | Premium Creator |
| :--- | :--- | :--- |
| **Questions** | 5 | Unlimited (Optional) |
| **Prompt Injection** | Generic Templates | Specific Slot Filling |
| **Control** | "Make me a Wizard" | "Wizard, 5'6", scar on left eye, hates cats" |
| **Market Ready** | No | Yes |

## Task Backlog Integration
*   **TS-024:** Define JSON Schema for Question Taxonomy.
*   **TS-025:** Build "Question Pack" Selector UI.
*   **TS-026:** Implement "Premium Toggle" in Act I.
