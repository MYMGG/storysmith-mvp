# StorySmith RNG & Variation Architecture (v1)

## Goal
Avoid the "Day of the Tentacle" problem (limited options leading to samey outputs).
Structure variation so it feels infinite but remains coherent.

## Core Concepts

### 1. Variation Knobs (Global)
These are high-level inputs that bias all downstream RNG.
*   **Tone:** `[Whimsical, Gritty, Melancholy, High-Octane, Cozy]`
*   **Pacing:** `[Slow burn, Rapid fire, Episodic]`
*   **Complexity:** `[Linear, Twist-heavy, Character-driven]`

### 2. Weighted Pools
Instead of flat lists, use weighted pools based on Genre/Tone.
*   *Example:* In a "Cozy" story, `Tea Shop` (Loc) has 0.8 weight, `Haunted Castle` has 0.01 weight.
*   *Implementation:* `getWeightedRandom(pool, context_modifiers)`

### 3. Mutual Exclusions (Anti-Contradiction)
*   **Rule:** If `Setting=Underwater`, disable `Action=Lighting a fire`.
*   **Tagging System:** All prompt fragments need tags (e.g., `#outdoors`, `#magic`, `#tech`).

### 4. Seed & Replay
*   All valid seeds are stored in `Blueprint`.
*   Users can "Re-roll" a station, which generates a new seed for that station only.
*   "Locking": Once a user manually edits a text, the seed for that section becomes irrelevant (it is now "Custom").

## Anti-Samey Test Plan

### Methodology
1.  **Batch Gen:** Script that runs the prompt assembly logic 100 times with random inputs.
2.  **Vector Similarity:** Use an embedding model (local or API) to check cosine similarity between generated text prompts.
3.  **Keyword Overlap:** Heuristic check (Jaccard index) of significant nouns/verbs.

### Thresholds
*   **Critical Fail:** 2+ stories share >50% identical phrase structure.
*   **Warning:** >30% overlap in "Unique Nouns".
*   **Pass:** Distinct variations in setting, conflict, and resolution.

## Task Backlog Integration
*   **TS-021:** Implement Weighted Random Utility.
*   **TS-022:** Tagging System for Prompt Fragments.
*   **TS-023:** "Anti-Samey" Unit Test Suite.
