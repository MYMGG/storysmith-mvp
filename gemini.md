# Project Constitution (gemini.md)

## Data Schemas
- StoryState (canonical)
  - version: number
  - metadata: { session_id: string, last_updated: number, last_prompt: string | null }
  - story_data: { story_title: string, thematic_tone: string | null, visual_style: string | null, visual_consistency_tag: string | null }
  - story_content:
    - CharacterBlock: { hero_name: string, hero_description: string, hero_image_url: string | null, hero_image_prompt: string | null, traits: object }
    - StoryBlueprintBlock: object | null
    - SceneJSON_array: Scene[]
    - Cover: { cover_image_url: string | null, cover_image_prompt: string | null, cover_title: string | null } | null
    - AssetsManifest: { hero_image: string | null, cover_image: string | null, scene_images: string[] } | null
- Scene (StoryState.story_content.SceneJSON_array[])
  - scene_id: string
  - scene_title: string
  - scene_status: "pending_illustration" | "illustrated" | string
  - scene_text_components: { beginning: string, middle: string, end: string } | null
  - scene_full_text: string
  - illustration_prompt: string | null
  - illustration_url: string | null
  - continuity_notes: string | null
- Bundle Envelope
  - bundleType: "Part1" | "Part2" | "Final"
  - bundleVersion: "1.0"
  - exportedAt: ISO-8601 string
  - StoryState: StoryState
- Bundle Requirements
  - Part1: CharacterBlock required, SceneJSON_array empty
  - Part2: CharacterBlock required; SceneJSON_array length > 0; illustration_prompt required; Cover.cover_image_prompt required; illustration_url/cover_image_url null
  - Final: CharacterBlock required; SceneJSON_array with illustration_url populated; Cover.cover_image_url populated; AssetsManifest complete

## Behavioral Rules
- Follow B.L.A.S.T. protocol and A.N.T. architecture.
- Prioritize deterministic, testable automation.
- Never guess at business logic.

## Architectural Invariants
- Tools live in tools/ and are deterministic Python scripts.
- Intermediate files live in .tmp/.
- SOPs live in architecture/ and must be updated before logic changes.

## Maintenance Log
TBD.
