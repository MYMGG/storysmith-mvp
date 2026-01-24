# StorySmith UX Journey: Acts & Stations (v1)

## Philosophy
Move from "Technical Stages" (Input -> Process -> Output) to "Emotional Stages" (Inspiration -> Creation -> Realization).
Each Act concludes with a concrete "Proof of Work" (Achievement Landing Page) that rewards the user before moving to the next phase.

## The 8-Act Journey

### Act I: The Summoning (Hero Origin)
**Goal:** Define the protagonist.
**Input:** User answers questions about the hero.
**Stations:**
1.  **The Mirror:** "Who are you?" (Name, Role, Archetype).
2.  **The Spark:** "What drives you?" (Desire, Fear).
3.  **The Equip:** "What do you carry?" (Props, Costume).
**Output:** `CharacterBlock` (JSON).
**Achievement Page:** "The Hero Born."
- **Artifact:** Hero Card (Trading card style).
- **Badge:** "Forge Master".
- **Copy:** "A legend begins. Your hero is ready for the unknown."

### Act II: The Compass (Story Blueprint)
**Goal:** Define the structural skeleton.
**Input:** Genre, Tone, Setting, Moral.
**Stations:**
1.  **The Map:** "Where are we?" (Setting, Era).
2.  **The Tone:** "How does it feel?" (Whimsical, Dark, Epic) - *RNG Heavy*.
3.  **The Skeleton:** "What happens?" (Logline, Chapter Outline).
**Output:** `StoryBlueprint` (JSON).
**Achievement Page:** "The Architect's Blueprint."
- **Artifact:** Blueprint Scroll (Visual timeline).
- **Badge:** "Story Weaver".
- **Copy:** "The path is charted. Destiny awaits."

### Act III: The Draft (Manuscript)
**Goal:** Write the words. No distractions.
**Input:** Beat-by-beat expansion.
**Stations:**
1.  **The Opening:** Writing the setup.
2.  **The Middle:** Writing the conflict.
3.  **The Climax:** Writing the resolution.
**Output:** `ManuscriptText` (JSON).
**Achievement Page:** "The First Draft."
- **Artifact:** Rough Draft Stack (Visual of messy papers).
- **Badge:** "Wordsmith".
- **Copy:** "The ink is dry. Now to bring it to life."

### Act IV: The Vision (Art Direction)
**Goal:** Define the visual language *before* generation.
**Input:** Style choices, Artist references, Color palette.
**Stations:**
1.  **The Palette:** Choosing colors.
2.  **The Style:** choosing logic (Watercolor, Pixar, Noir).
3.  **The Casting:** Confirming character consistency visual cues.
**Output:** `ArtBible` (JSON).
**Achievement Page:** "The Art Bible."
- **Artifact:** Style Guide (Moodboard).
- **Badge:** "Visionary".
- **Copy:** "A sight to behold. The world has color."

### Act V: The Studio (Production)
**Goal:** Generate the assets. The "Heavy Lifting" phase.
**Input:** Approvals.
**Stations:**
1.  **The Shoot:** Batch generation of images.
2.  **The Dailies:** Reviewing/Selecting/Regenerating.
**Output:** `AssetManifest` (Completed Images).
**Achievement Page:** "The Gallery."
- **Artifact:** Contact Sheet (Grid of all images).
- **Badge:** "Director".
- **Copy:** "captured in light. The scenes are set."

### Act VI: The Press (Assembly)
**Goal:** Put text and image together.
**Input:** Layout choices.
**Stations:**
1.  **The Typesetter:** Font selection, Text placement.
2.  **The Layout:** Image cropping, page flow.
3.  **The Proof:** Final review of the spread.
**Output:** `PrintReadyPages` (JSON/HTML).
**Achievement Page:** "The Proof Copy."
- **Artifact:** Virtual 3D Book (Spinning unopen book).
- **Badge:** "Bookbinder".
- **Copy:** "Bound in magic. Ready for the world."

### Act VII: The Dedication (Personalization)
**Goal:** Final touches.
**Input:** Dedication text, Author bio, Back cover blurb.
**Stations:**
1.  **The Signature:** "Written by..."
2.  **The Dedication:** "For..."
3.  **The Blurb:** Selling the story.
**Output:** `BookMetadata`.
**Achievement Page:** "The Author's Bio."
- **Artifact:** Back Cover Preview.
- **Badge:** "Published Author".
- **Copy:** "Signed and sealed."

### Act VIII: The Unveiling (Release)
**Goal:** Celebration and distribution.
**Input:** None.
**Stations:**
1.  **The Premiere:** "Open the Book."
2.  **The Share:** Download/Link.
**Output:** Final Bundle.
**Achievement Page:** "Grand Unveiling."
- **Artifact:** The Open Book (Interactive Viewer).
- **Badge:** "StorySmith Legend".
- **Copy:** "Your story is told."
