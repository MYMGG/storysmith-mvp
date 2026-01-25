export function blueprintFromStoryState(storyState) {
  if (!storyState) return { premise: '', scenes: [], theme: null };

  const summary = storyState.story_content?.StoryBlueprintBlock?.summary_sections;
  const summaryParts = [summary?.beginning, summary?.middle, summary?.end].filter(Boolean);
  const heroName =
    storyState.story_content?.CharacterBlock?.hero_name
    || storyState.story_content?.CharacterBlock?.character_details?.name
    || 'The hero';
  const storyTitle = storyState.story_data?.story_title || 'this tale';
  const sceneCount = storyState.story_content?.SceneJSON_array?.length || 0;

  const premise = summaryParts.length
    ? summaryParts.join(' ')
    : sceneCount
      ? `${heroName} faces a ${sceneCount}-scene journey in ${storyTitle}.`
      : `${heroName} steps into ${storyTitle}.`;

  const scenes = (storyState.story_content?.SceneJSON_array || []).map((scene, index) => {
    const rawText = scene.scene_full_text || '';
    const firstSentence = rawText.split('. ').shift();
    const beat = firstSentence
      ? `${firstSentence.trim()}${firstSentence.trim().endsWith('.') ? '' : '.'}`
      : 'Scene beat not specified.';
    return {
      title: scene.scene_title || `Scene ${index + 1}`,
      beat,
    };
  });

  const theme = storyState.story_data?.thematic_tone || null;

  return { premise, scenes, theme };
}

export default blueprintFromStoryState;
