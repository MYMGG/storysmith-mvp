import { blueprintFromStoryState } from '../lib/blueprintFromStoryState';

export default function StoryBlueprintPanel({ storyState, title = 'Story Blueprint' }) {
  const blueprint = blueprintFromStoryState(storyState);

  if (!blueprint.premise && blueprint.scenes.length === 0) {
    return null;
  }

  return (
    <div className="bg-black/35 border border-stone-600/60 rounded-2xl p-6 shadow-xl text-stone-100">
      <h3 className="text-xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>{title}</h3>
      <p className="mt-3 text-sm text-stone-300 leading-relaxed">{blueprint.premise}</p>
      <div className="mt-4 space-y-3">
        {blueprint.scenes.map((scene, index) => (
          <div key={`${scene.title}-${index}`} className="bg-black/30 rounded-lg p-3">
            <p className="text-xs uppercase tracking-widest text-amber-300">Scene {index + 1}</p>
            <p className="text-base font-semibold mt-1">{scene.title}</p>
            <p className="text-sm text-stone-300 mt-1">{scene.beat}</p>
          </div>
        ))}
      </div>
      {blueprint.theme && (
        <div className="mt-4 text-sm text-stone-300">
          <span className="text-xs uppercase tracking-widest text-stone-400">Theme</span>
          <p className="mt-1">{blueprint.theme}</p>
        </div>
      )}
    </div>
  );
}
