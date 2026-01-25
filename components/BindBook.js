// components/BindBook.js

import { useState, useEffect } from 'react';
import { importBundle } from '../lib/bundleImporter';
import { exportBundle } from '../lib/bundleExporter';
import ProductionChecklist from './ProductionChecklist';
import StoryBlueprintPanel from './StoryBlueprintPanel';

// The Ledger is now an internal component, styled to fit the new "floating UI"
const formatTraits = (traits) => {
  if (!traits) return '—';
  if (typeof traits === 'string') return traits;
  if (Array.isArray(traits)) return traits.filter(Boolean).join(', ');
  if (typeof traits === 'object') {
    if (traits.wardrobe || traits.signatureItem) {
      const parts = [];
      if (traits.wardrobe) parts.push(`Wardrobe: ${traits.wardrobe}`);
      if (traits.signatureItem) parts.push(`Signature: ${traits.signatureItem}`);
      return parts.length > 0 ? parts.join('; ') : '—';
    }
    return JSON.stringify(traits);
  }
  return String(traits);
};

const LedgerContent = ({ storyState }) => {
  const hero = storyState.story_content?.CharacterBlock?.character_details || {};
  const scenes = storyState.story_content?.SceneJSON_array || [];

  return (
    <div className="w-full max-w-lg mx-auto bg-black/20 backdrop-blur-sm border border-stone-500/50 rounded-lg p-6 text-stone-200 shadow-lg max-h-[60vh] overflow-y-auto custom-scrollbar">
      <h3 className="text-2xl font-bold text-center mb-4" style={{ fontFamily: 'Cinzel, serif' }}>The Grand Ledger</h3>

      <div className="border-t border-stone-600/50 pt-4 mt-4">
        <h4 className="text-xl font-bold text-stone-300 mb-2">Hero: {hero.name}</h4>
        <p className="text-stone-300 text-sm">Age: {hero.age}, Gender: {hero.gender}, Traits: {formatTraits(hero.traits)}</p>
      </div>

      <div className="border-t border-stone-600/50 pt-4 mt-4">
        <h4 className="text-xl font-bold text-stone-300 mb-2">Scenes:</h4>
        <div className="space-y-3">
          {scenes.map((scene) => (
            <div key={scene.scene_id}>
              <h5 className="font-semibold text-stone-200">{scene.scene_title}</h5>
              <p className="text-sm text-stone-400 leading-tight">{scene.scene_full_text.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function BindBook({ storyState, setStoryState, setActiveTab, setSharedResponse, resetApp }) {
  const [currentBindBookStep, setCurrentBindBookStep] = useState(0);
  const [finalAuthor, setFinalAuthor] = useState('');
  const [finalDedication, setFinalDedication] = useState('');
  const [importError, setImportError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [hasStartedBind, setHasStartedBind] = useState(false);
  const [generationState, setGenerationState] = useState({
    status: 'idle',
    currentIndex: 0,
    totalScenes: 0,
    scenes: [],
    cover: { status: 'pending', error: null },
  });

  // Check if we have valid scene data to proceed
  const hasValidSceneData = storyState.story_content?.SceneJSON_array?.length > 0;
  const hasAllIllustrations = (storyState.story_content?.SceneJSON_array || []).every(
    (scene) => Boolean(scene.illustration_url)
  ) && Boolean(storyState.story_content?.Cover?.cover_image_url);

  useEffect(() => {
    // If we already have scene data, advance to step 1 (review)
    if (hasValidSceneData) {
      setSharedResponse("A grand undertaking awaits! The time has come to bind our woven tale.");
      if (hasStartedBind) {
        setCurrentBindBookStep(1);
      } else {
        setCurrentBindBookStep(0);
      }
    } else {
      setSharedResponse("Welcome to Act III! Prepare the bundle to begin binding.");
      setCurrentBindBookStep(0);
    }
  }, [hasValidSceneData, hasStartedBind]);

  const buildAssetsManifest = (state) => {
    const characterBlock = state.story_content?.CharacterBlock || {};
    const heroImage = characterBlock.hero_image_url || characterBlock.character_details?.hero_image_url || null;
    const coverImage = state.story_content?.Cover?.cover_image_url || null;
    const sceneImages = (state.story_content?.SceneJSON_array || [])
      .map((scene) => scene.illustration_url)
      .filter(Boolean);

    return {
      hero_image: heroImage,
      cover_image: coverImage,
      scene_images: sceneImages,
    };
  };

  const manifestMatches = (current, next) => {
    if (!current || !next) return false;
    if (current.hero_image !== next.hero_image) return false;
    if (current.cover_image !== next.cover_image) return false;
    if (!Array.isArray(current.scene_images) || !Array.isArray(next.scene_images)) return false;
    if (current.scene_images.length !== next.scene_images.length) return false;
    return current.scene_images.every((url, index) => url === next.scene_images[index]);
  };

  useEffect(() => {
    if (!hasAllIllustrations) return;

    setStoryState((prev) => {
      const nextManifest = buildAssetsManifest(prev);
      if (manifestMatches(prev.story_content?.AssetsManifest, nextManifest)) {
        return prev;
      }
      return {
        ...prev,
        story_content: {
          ...prev.story_content,
          AssetsManifest: nextManifest,
        },
      };
    });
  }, [hasAllIllustrations, setStoryState]);

  const buildSceneProgress = (scenes, previous = []) => scenes.map((scene, index) => {
    const id = String(scene.scene_id ?? index + 1);
    const previousEntry = previous.find((entry) => entry.id === id);
    const hasImage = Boolean(scene.illustration_url);
    return {
      id,
      title: scene.scene_title || `Scene ${index + 1}`,
      status: hasImage ? 'done' : previousEntry?.status === 'failed' ? 'failed' : 'pending',
      error: previousEntry?.error || null,
    };
  });

  const updateSceneProgress = (sceneId, updates) => {
    setGenerationState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((scene) => (scene.id === sceneId ? { ...scene, ...updates } : scene)),
    }));
  };

  const updateCoverProgress = (updates) => {
    setGenerationState((prev) => ({
      ...prev,
      cover: { ...prev.cover, ...updates },
    }));
  };

  const requestImage = async (prompt) => {
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('STORYSMITH_API_KEY') : null;
    const response = await fetch('/api/generateImage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, apiKey }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Image generation failed.');
    }

    const data = await response.json();
    return data.imageUrl;
  };

  const startImageGeneration = async ({ retryFailedOnly = false } = {}) => {
    if (generationState.status === 'running') return;

    const scenes = storyState.story_content?.SceneJSON_array || [];
    if (scenes.length === 0) {
      setSharedResponse('No scenes found to illustrate. Please return to Act II.');
      return;
    }

    const initialScenes = buildSceneProgress(scenes, retryFailedOnly ? generationState.scenes : []);
    const coverHasImage = Boolean(storyState.story_content?.Cover?.cover_image_url);
    const coverStatus = coverHasImage ? 'done' : retryFailedOnly ? generationState.cover.status : 'pending';

    setGenerationState({
      status: 'running',
      currentIndex: 0,
      totalScenes: scenes.length,
      scenes: initialScenes,
      cover: { status: coverStatus === 'failed' ? 'failed' : coverStatus, error: null },
    });

    let encounteredFailure = false;

    for (let index = 0; index < scenes.length; index += 1) {
      const scene = scenes[index];
      const sceneId = String(scene.scene_id ?? index + 1);
      const progressEntry = initialScenes.find((entry) => entry.id === sceneId);

      const shouldGenerate = retryFailedOnly
        ? progressEntry?.status === 'failed'
        : !scene.illustration_url;

      if (!shouldGenerate) {
        continue;
      }

      setSharedResponse(`Illustrating ${scene.scene_title || `Scene ${index + 1}`}...`);
      setGenerationState((prev) => ({ ...prev, currentIndex: index + 1 }));
      updateSceneProgress(sceneId, { status: 'working', error: null });

      try {
        if (!scene.illustration_prompt) {
          throw new Error('Missing illustration prompt.');
        }

        const imageUrl = await requestImage(scene.illustration_prompt);

        setStoryState((prev) => {
          const updatedScenes = (prev.story_content?.SceneJSON_array || []).map((item, itemIndex) => {
            const itemId = String(item.scene_id ?? itemIndex + 1);
            if (itemId !== sceneId) return item;
            return {
              ...item,
              illustration_url: imageUrl,
              scene_status: 'illustrated',
            };
          });

          return {
            ...prev,
            story_content: {
              ...prev.story_content,
              SceneJSON_array: updatedScenes,
            },
          };
        });

        updateSceneProgress(sceneId, { status: 'done' });
      } catch (error) {
        encounteredFailure = true;
        updateSceneProgress(sceneId, { status: 'failed', error: error.message });
      }
    }

    const cover = storyState.story_content?.Cover;
    if (cover && cover.cover_image_prompt) {
      const shouldGenerateCover = retryFailedOnly
        ? generationState.cover.status === 'failed'
        : !cover.cover_image_url;

      if (shouldGenerateCover) {
        setSharedResponse('Conjuring the cover illustration...');
        updateCoverProgress({ status: 'working', error: null });

        try {
          const coverUrl = await requestImage(cover.cover_image_prompt);
          setStoryState((prev) => ({
            ...prev,
            story_content: {
              ...prev.story_content,
              Cover: {
                ...(prev.story_content?.Cover || {}),
                cover_image_url: coverUrl,
              },
            },
          }));
          updateCoverProgress({ status: 'done' });
        } catch (error) {
          encounteredFailure = true;
          updateCoverProgress({ status: 'failed', error: error.message });
        }
      }
    }

    setGenerationState((prev) => ({
      ...prev,
      status: encounteredFailure ? 'error' : 'complete',
    }));

    if (encounteredFailure) {
      setSharedResponse('Some illustrations failed. You can retry the failed ones.');
    } else {
      setSharedResponse('All illustrations are complete!');
    }
  };

  const handleFileUpload = async (event) => {
    // Handle both file input change events and drag-drop events
    let file;
    if (event.target?.files) {
      file = event.target.files[0];
    } else if (event.dataTransfer?.files) {
      file = event.dataTransfer.files[0];
    }

    if (!file) return;

    setImportError(null);
    setIsImporting(true);
    setSharedResponse("Reviewing the woven tale...");

    try {
      const result = await importBundle(file, 'Part2');
      if (result.success) {
        setStoryState(result.storyState);
        setSharedResponse("The tale has been received! Let us review the Grand Ledger.");
        setCurrentBindBookStep(1);
      } else {
        setImportError(result.errors);
        setSharedResponse("Alas, this scroll seems incomplete. Please check the errors below.");
      }
    } catch (err) {
      console.error("Import failed:", err);
      setImportError(["An unexpected error occurred while reading the bundle."]);
      setSharedResponse("The binding magic faltered. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e);
  };

  const handleFinalize = () => {
    setStoryState(prev => ({ ...prev, story_content: { ...prev.story_content, Cover: { ...prev.story_content?.Cover, author_attribution: finalAuthor, dedication: finalDedication } } }));
    setSharedResponse("And there you have it! A legend captured, a story born of wonder and heart, now complete!");
    setCurrentBindBookStep(4);
  };

  const handleFinalExport = () => {
    try {
      const result = exportBundle(storyState, 'Final');
      const blob = new Blob([result.jsonString], { type: result.mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSharedResponse('Your final Story Bundle is ready!');
    } catch (error) {
      console.error('[BindBook] Final export failed:', error);
      setSharedResponse(`Final export failed: ${error.message}`);
    }
  };

  const handleOpenViewer = () => {
    try {
      const result = exportBundle(storyState, 'Final');
      if (typeof window !== 'undefined') {
        localStorage.setItem('storysmith_final_bundle', result.jsonString);
        window.open('/viewer/upload?source=local', '_blank', 'noopener');
      }
    } catch (error) {
      console.error('[BindBook] Viewer launch failed:', error);
      setSharedResponse(`Unable to open viewer: ${error.message}`);
    }
  };

  const handleCopyShare = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (error) {
      console.error('[BindBook] Share copy failed:', error);
      setSharedResponse('Could not copy the share blurb.');
    }
  };

  const choiceButtonStyle = "w-full max-w-md text-left p-4 bg-black/20 backdrop-blur-sm border border-stone-500/50 rounded-lg text-stone-200 hover:bg-stone-700/70 hover:border-stone-400 transition-all duration-300 shadow-lg";

  const renderStepContent = () => {
    switch (currentBindBookStep) {
      case 0: // Import Bundle
        return (
          <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-6">
            <h2 className="text-3xl font-bold text-stone-100" style={{ fontFamily: 'Cinzel, serif' }}>
              Begin Act III: Bind Book
            </h2>

            <div className="max-w-md w-full bg-black/40 backdrop-blur-md border border-stone-600 rounded-xl p-6 shadow-2xl">
              <p className="text-stone-300 mb-6">
                {hasValidSceneData
                  ? 'Your scenes are ready. Begin binding your book.'
                  : 'To bind your story, the scenes must be woven in Act II.'}
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    if (!hasValidSceneData) {
                      setSharedResponse("We need the Act II scenes before binding.");
                      return;
                    }
                    setHasStartedBind(true);
                    setCurrentBindBookStep(1);
                  }}
                  className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition-all shadow-lg"
                >
                  Start Binding
                </button>
              </div>
            </div>

            <div className="fixed bottom-6 right-6">
              <label
                className="cursor-pointer px-3 py-2 text-xs uppercase tracking-widest text-stone-300 border border-stone-600/60 bg-black/40 rounded-full hover:border-amber-500/60 transition"
                onDragOver={onDragOver}
                onDrop={onDrop}
              >
                Import Bundle (Dev)
                <input
                  type="file"
                  className="hidden"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  disabled={isImporting}
                />
              </label>
            </div>

            {isImporting && (
              <p className="text-amber-400 text-sm">Reading the scroll...</p>
            )}

            {importError && (
              <div className="fixed bottom-20 right-6 max-w-xs p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm text-left">
                <p className="font-bold mb-1">Import Failed</p>
                <ul className="list-disc list-inside space-y-1">
                  {importError.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 1: // Review Ledger
        return (
          <div className="w-full max-w-lg mx-auto space-y-4">
            <LedgerContent storyState={storyState} />
            <ProductionChecklist storyState={storyState} />
            <button
              onClick={() => {
                setCurrentBindBookStep(2);
                startImageGeneration();
              }}
              className={`${choiceButtonStyle} text-center`}
            >
              Yes, it's perfect! Let's conjure the illustrations.
            </button>
            <button onClick={() => setActiveTab(0)} className={`${choiceButtonStyle} text-center`}>I need to make a change.</button>
          </div>
        );
      case 2: // Image Generation
        return (
          <div className="w-full max-w-xl mx-auto space-y-6">
            <div className="bg-black/30 border border-stone-600/60 rounded-xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold text-stone-100 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                Illustration Forge
              </h3>
              <p className="text-sm text-stone-300">
                We are painting each scene and your cover. You can watch the progress below.
              </p>
            </div>

            <ProductionChecklist storyState={storyState} />

            <div className="bg-black/25 border border-stone-600/40 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-stone-300">
                <span>Scenes illustrated</span>
                <span>
                  {generationState.scenes.filter((scene) => scene.status === 'done').length} /
                  {generationState.scenes.length}
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {generationState.scenes.map((scene) => (
                  <div key={scene.id} className="text-sm text-stone-200">
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-3">{scene.title}</span>
                      <span className="text-xs uppercase tracking-wide">
                        {scene.status}
                      </span>
                    </div>
                    {scene.status === 'failed' && scene.error && (
                      <p className="text-xs text-red-300 mt-1">{scene.error}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-stone-300">
                <span>Cover illustration</span>
                <span className="text-xs uppercase tracking-wide text-stone-200">
                  {generationState.cover.status}
                </span>
              </div>
              {generationState.cover.status === 'failed' && generationState.cover.error && (
                <p className="text-xs text-red-300">{generationState.cover.error}</p>
              )}
            </div>

            {generationState.status === 'idle' && (
              <button
                onClick={() => startImageGeneration()}
                className={`${choiceButtonStyle} text-center`}
              >
                Begin Illustration Forge
              </button>
            )}

            {generationState.status === 'running' && (
              <p className="text-amber-400 text-sm text-center">Illustrations in progress...</p>
            )}

            {generationState.status === 'error' && (
              <button
                onClick={() => startImageGeneration({ retryFailedOnly: true })}
                className={`${choiceButtonStyle} text-center`}
              >
                Retry Failed Illustrations
              </button>
            )}

            {hasAllIllustrations && generationState.status !== 'running' && (
              <button
                onClick={() => setCurrentBindBookStep(3)}
                className={`${choiceButtonStyle} text-center`}
              >
                Continue to Final Touches
              </button>
            )}
          </div>
        );
      case 3: // Author & Dedication
        setSharedResponse("The story is perfect. Now for the final, personal touches.");
        return (
          <div className="w-full max-w-lg mx-auto space-y-4">
            <div>
              <label htmlFor="authorAttribution" className="block text-stone-300 text-sm font-bold mb-2">By whom was this tale lovingly crafted?</label>
              <input type="text" id="authorAttribution" value={finalAuthor} onChange={(e) => setFinalAuthor(e.target.value)} className="w-full p-3 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 border border-stone-600" placeholder="Your name, or a magical pseudonym!" />
            </div>
            <div>
              <label htmlFor="dedication" className="block text-stone-300 text-sm font-bold mb-2">And for whom is this legendary book intended?</label>
              <textarea id="dedication" value={finalDedication} onChange={(e) => setFinalDedication(e.target.value)} rows="3" className="w-full p-3 rounded-lg bg-gray-900/70 text-white" placeholder="To my brave little adventurer..."></textarea>
            </div>
            <button onClick={handleFinalize} className={`${choiceButtonStyle} text-center`}>Prepare for Grand Finale!</button>
          </div>
        );
      case 4: // Completion
        const heroName = storyState.story_content?.CharacterBlock?.hero_name
          || storyState.story_content?.CharacterBlock?.character_details?.name
          || 'Your hero';
        const storyTitle = storyState.story_data?.story_title || 'Your Story';
        const coverUrl = storyState.story_content?.Cover?.cover_image_url;
        const authorName = storyState.story_content?.Cover?.author_attribution || 'Unknown Creator';
        const dedication = storyState.story_content?.Cover?.dedication || 'Not specified';
        const shareText = `${heroName}'s adventure is ready in "${storyTitle}." Open the StorySmith book to explore every illustrated scene.`;
        return (
          <div className="w-full max-w-3xl mx-auto space-y-6">
            <div className="bg-black/40 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Grand Unveiling</p>
              <h2 className="text-3xl font-bold text-stone-100 mt-2" style={{ fontFamily: 'Cinzel, serif' }}>
                {storyTitle}
              </h2>
              <p className="text-stone-300 mt-2">A finished story, bound with pride.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
              <div className="bg-black/30 border border-stone-600/50 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-48 h-64 rounded-xl overflow-hidden border border-amber-500/40 bg-stone-800/60 flex items-center justify-center">
                    {coverUrl ? (
                      <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <p className="text-sm text-stone-300">Cover preview pending</p>
                    )}
                  </div>
                  <div className="w-full space-y-3">
                    <button
                      onClick={handleOpenViewer}
                      className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition-all shadow-lg"
                    >
                      Open Your Book
                    </button>
                    {hasAllIllustrations && (
                      <button
                        onClick={handleFinalExport}
                        className="w-full px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg font-semibold transition-all"
                      >
                        Download Final Bundle
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-black/40 border border-stone-700 rounded-xl p-4 text-stone-200">
                  <p className="text-xs uppercase tracking-widest text-stone-400">Creator Credits</p>
                  <p className="mt-2 text-sm"><span className="text-stone-400">Created by:</span> {authorName}</p>
                  <p className="text-sm"><span className="text-stone-400">Created for:</span> {dedication}</p>
                  <p className="text-sm"><span className="text-stone-400">Date:</span> {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <ProductionChecklist storyState={storyState} />
                <StoryBlueprintPanel storyState={storyState} title="Story Blueprint" />
                <div className="bg-black/30 border border-stone-600/60 rounded-2xl p-5 text-stone-100">
                  <h3 className="text-sm uppercase tracking-[0.2em] text-stone-300">Share Pack</h3>
                  <p className="text-sm text-stone-300 mt-3">{shareText}</p>
                  <button
                    onClick={() => handleCopyShare(shareText)}
                    className="mt-4 w-full px-4 py-2 border border-amber-500/50 text-amber-300 rounded-lg text-sm font-semibold hover:bg-amber-500/10 transition"
                  >
                    {shareCopied ? 'Copied!' : 'Copy Share Blurb'}
                  </button>
                </div>
                <button onClick={resetApp} className={`${choiceButtonStyle} text-center`}>Start a New Adventure!</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8">
      {renderStepContent()}
    </div>
  );
}
