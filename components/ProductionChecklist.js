export default function ProductionChecklist({ storyState, title = 'Production Checklist' }) {
  const scenes = storyState?.story_content?.SceneJSON_array || [];
  const heroReady = Boolean(storyState?.story_content?.CharacterBlock);
  const scenesReady = scenes.length > 0;
  const promptsReady = scenes.length > 0
    && scenes.every((scene) => Boolean(scene.illustration_prompt))
    && Boolean(storyState?.story_content?.Cover?.cover_image_prompt);
  const illustratedCount = scenes.filter((scene) => Boolean(scene.illustration_url)).length;
  const illustrationsReady = scenes.length > 0
    && illustratedCount === scenes.length
    && Boolean(storyState?.story_content?.Cover?.cover_image_url);
  const exportReady = illustrationsReady && Boolean(storyState?.story_content?.AssetsManifest);

  const items = [
    { label: 'Hero', ready: heroReady },
    { label: 'Story Scenes', ready: scenesReady },
    { label: 'Illustration Prompts', ready: promptsReady },
    {
      label: `Illustrations (${illustratedCount}/${scenes.length || 0})`,
      ready: illustrationsReady,
    },
    { label: 'Export Ready', ready: exportReady },
  ];

  return (
    <div className="bg-black/30 border border-stone-600/50 rounded-xl p-5 shadow-lg">
      <h3 className="text-sm uppercase tracking-[0.2em] text-stone-300 font-semibold mb-4">
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm text-stone-200">
            <span>{item.label}</span>
            <span className={item.ready ? 'text-emerald-400' : 'text-stone-500'}>
              {item.ready ? '✓' : '○'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
