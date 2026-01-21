SpecName: StorySmith Composite Baseline (Redacted)
Version: v3.0
RedactionLevel: REDACTED_repo_safe
CanonicalActs: 3
SourceInputs:
- docs/_incoming/STAGE 2 — Full Composite Baseline (V3 Pack + ZIP Design Schema) (3).md
LastUpdated: 2026-01-20

# **StorySmith Baseline Template (Redacted)**

`TITLE: StorySmith Current Baseline Template (Redacted)`

`RULE: Do not assume. If any required detail is missing, ask the user for it and label the gap UNKNOWN.`

`1) SYSTEM DEFINITION`
`StorySmith is a multi-act guided workflow that:`
`- Act I: Forge the Hero (CharacterBlock + optional hero portrait)`
`- Act II: Weave Scenes (SceneJSON_array with approved scene_full_text + illustration_prompt; mark pending_illustration)`
`- Act III: Bind & Preserve (centralized image generation + cover + AssetsManifest + packaging outputs)`

`2) ACT MODES`
`- DataCraft Mode = structured schema capture`
`- Persona Mode = guest-facing role`

`3) KERNEL MODULES`
`- Stateful Memory Kernel: load/update state on every choice`
`- Context Kernel: mission reinforcement at act transitions + pre-generation checks`
`- Illustration Engine Kernel: construct prompts; enforce visual consistency tags`
`- Reflex Recovery Kernel: restore last valid state on failure/timeout`
`- Packaging & QA Kernel: validate completeness; compile assets; assemble deliverables`

`4) CANONICAL IMAGE PIPELINE (SELECTED)`
`Act II:`
`- Generate/lock scene text`
`- Construct illustration_prompt`
`- Store illustration_prompt into SceneJSON_array[i].illustration_prompt`
`- Set scene_status = "pending_illustration"`
`- DO NOT generate images in Act II`
`Act III:`
`- Populate illustration_url for all scenes (central loop)`
`- Populate Cover.cover_image_url`
`- Populate AssetsManifest (hero + scenes + cover)`
`- Package outputs (HTML + PDF) and export final state JSON`

`5) DATA CONTRACTS (CORE)`
`State wrapper conventions:`
`- Bundles MAY wrap state as StoryState.`
`- Some schemas MAY name the root SessionState.`
`- Treat this as a wrapper alias only.`

`Required internal blocks (minimum):`
`- metadata: session_id, last_updated, last_prompt`
`- story_data: story_title, thematic_tone, visual_style, visual_consistency_tag`
`- story_content:`
  `- CharacterBlock`
  `- StoryBlueprintBlock`
  `- SceneJSON_array[ { scene_id, scene_title, scene_status, scene_text_components, scene_full_text, illustration_prompt, illustration_url, continuity_notes } ]`
  `- Cover`
  `- AssetsManifest`

`6) PROMPTTREE INTEGRATION (AUTHORITATIVE)`
`- PromptTree is a JSON constraint tree with prioritized nodes and a rendering contract.`
`- Renderer should emit Output headers, hard rules, then MUST nodes.`

`7) DELIVERABLES`
`- Act I output: MyHeroAssetBundle_Part1.json`
`- Act II output: MyStoryAssetBundle_Part2.json`
`- Act III/IV outputs: Interactive HTML e-book, PDF, Final state JSON, AssetsManifest`

`8) REQUIRED VERIFICATIONS (IF UNKNOWN)`
`- Which image tool/provider is used in production (tool name + I/O contract)`
`- Where state persists between acts in the production app (DB/server/storage)`
`- How HTML/PDF are produced today (LLM output vs renderer vs pipeline)`
