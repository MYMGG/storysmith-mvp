// components/SpinTale.js

import { useState, useEffect } from 'react';
import { importBundle } from '../lib/bundleImporter';
import { exportBundle } from '../lib/bundleExporter';
import ProductionChecklist from './ProductionChecklist';
import StoryBlueprintPanel from './StoryBlueprintPanel';

export default function SpinTale({ storyState, setStoryState, setActiveTab, setSharedResponse, isLoading, isImageLoading }) {
  const [currentSpinTaleStep, setCurrentSpinTaleStep] = useState(0);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [importError, setImportError] = useState(null);
  const [showAct2Complete, setShowAct2Complete] = useState(false);
  const [blueprintError, setBlueprintError] = useState(null);
  const [hasStartedWeave, setHasStartedWeave] = useState(false);

  const hasBlueprintData = storyState.story_content?.StoryBlueprintBlock?.structure?.numberOfScenes > 0;
  const hasHeroData = storyState.story_content?.CharacterBlock?.character_details?.name;

  const generateAndDisplayScene = (sceneNum, totalScenes, hero) => {
    const heroName = hero.name || 'the brave hero';
    let sceneText = "";
    let sceneTitle = "";

    // Simplified scene generation logic
    if (sceneNum === 1) {
      sceneTitle = "The Call to Adventure";
      sceneText = `Scene 1: The Call to Adventure. Our hero, ${heroName}, stands at the edge of a whispering forest, the morning sun dappling through the leaves. A strange, shimmering light pulses from within the deepest part of the woods, beckoning them forward.`;
    } else if (sceneNum === totalScenes) {
      sceneTitle = "The Grand Return";
      sceneText = `Scene ${sceneNum}: The Grand Return. After their arduous journey, ${heroName}, emerges from the final challenge, triumphant. The weight of their quest lifts, replaced by a profound sense of accomplishment.`;
    } else {
      sceneTitle = `Scene ${sceneNum}: A New Challenge`;
      sceneText = `Scene ${sceneNum}: A New Challenge. The journey continues for ${heroName}. They venture deeper into the unknown, facing unexpected twists and turns.`;
    }

    setSharedResponse(`Behold, the tale of Scene ${sceneNum} unfolds before us! Does this passage capture the magic and adventure you envision?`);
    setStoryState(prev => {
      const newScene = {
        scene_id: sceneNum,
        scene_title: sceneTitle,
        scene_status: "pending_illustration",
        scene_full_text: sceneText,
        illustration_prompt: `An illustration for "${sceneTitle}" featuring ${heroName}. Style: ${prev.story_data?.visual_style || "3D animated Film"}`,
        illustration_url: null,
      };
      const updatedSceneArray = [...(prev.story_content?.SceneJSON_array || [])];
      const existingSceneIndex = updatedSceneArray.findIndex(s => s.scene_id === sceneNum);
      if (existingSceneIndex !== -1) {
        updatedSceneArray[existingSceneIndex] = newScene;
      } else {
        updatedSceneArray.push(newScene);
      }
      return { ...prev, story_content: { ...(prev.story_content || {}), SceneJSON_array: updatedSceneArray } };
    });
    setCurrentSpinTaleStep(1);
  };

  const generateBlueprint = async (heroDetails) => {
    if (isGeneratingBlueprint) return;
    setIsGeneratingBlueprint(true);
    setBlueprintError(null);
    setSharedResponse("Wonderful! With our hero forged in starlight, let us begin to spin their legendary tale!");

    try {
      const response = await fetch('/api/generateBlueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroDetails }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story blueprint.');
      }
      const data = await response.json();

      // Also initialize Cover prompt here to ensure validation passes later
      const heroName = heroDetails.name || "The Hero";
      const coverPrompt = `A movie poster for an epic adventure starring ${heroName}. Style: ${storyState.story_data?.visual_style || "3D animated Film"}`;

      setStoryState(prev => ({
        ...prev,
        story_content: {
          ...(prev.story_content || {}),
          StoryBlueprintBlock: data.story_content.StoryBlueprintBlock,
          Cover: {
            cover_image_prompt: coverPrompt,
            cover_image_url: null // Act III will generate this
          }
        }
      }));
      setSharedResponse("A blueprint of our tale is prepared! Let us now begin spinning the scenes.");

    } catch (error) {
      console.error("Blueprint generation failed:", error);
      setSharedResponse("The quill has run dry. An error occurred while preparing the tale.");
      setBlueprintError(error.message || 'Blueprint generation failed.');
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const handleExport = () => {
    try {
      const result = exportBundle(storyState, 'Part2');

      // Create and trigger download
      const blob = new Blob([result.jsonString], { type: result.mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSharedResponse("The scroll of Act II has been sealed and delivered to you!");
    } catch (err) {
      console.error("Export failed:", err);
      setSharedResponse(`Failed to seal the scroll: ${err.message}`);
    }
  };

  useEffect(() => {
    if (hasHeroData && hasStartedWeave && !hasBlueprintData && !isGeneratingBlueprint) {
      generateBlueprint(storyState.story_content.CharacterBlock.character_details);
    }
  }, [hasBlueprintData, hasHeroData, isGeneratingBlueprint, storyState]);

  useEffect(() => {
    if (hasBlueprintData && storyState.story_content.SceneJSON_array.length === 0) {
      setTimeout(() => {
        generateAndDisplayScene(1, storyState.story_content.StoryBlueprintBlock.structure.numberOfScenes, storyState.story_content.CharacterBlock.character_details);
      }, 1500);
    }
  }, [hasBlueprintData, storyState]);


  const handleFileUpload = async (event) => {
    // Handle both file input change events and drag-drop events
    let file;
    if (event.target.files) {
      file = event.target.files[0];
    } else if (event.dataTransfer && event.dataTransfer.files) {
      file = event.dataTransfer.files[0];
    }

    if (!file) return;

    setImportError(null);
    setSharedResponse("Reviewing the hero's chronicles...");

    try {
      const result = await importBundle(file, 'Part1');
      if (result.success) {
        setStoryState(result.storyState);
        setSharedResponse("Ah, a new hero arrives! Let us begin their tale.");
        setHasStartedWeave(true);
      } else {
        setImportError(result.errors.join('\n'));
        setSharedResponse("Alas, this scroll seems illegible. Please try another.");
      }
    } catch (err) {
      console.error("Import failed:", err);
      setImportError("An unexpected error occurred.");
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

  if (!hasHeroData || !hasStartedWeave) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold text-stone-100" style={{ fontFamily: 'Cinzel, serif' }}>
          Begin Act II: SpinTale
        </h2>

        <div className="max-w-md w-full bg-black/40 backdrop-blur-md border border-stone-600 rounded-xl p-6 shadow-2xl">
          <p className="text-stone-300 mb-6">
            {hasHeroData
              ? 'The hero stands ready. Begin weaving the story.'
              : 'To weave the tale, the hero must be forged in Act I.'}
          </p>

          <div className="space-y-4">
            <button
              onClick={() => {
                if (!hasHeroData) {
                  setSharedResponse("We need a hero before we can weave the tale.");
                  return;
                }
                setHasStartedWeave(true);
              }}
              className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition-all shadow-lg"
            >
              Start Weaving
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
              accept=".json"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {importError && (
          <div className="fixed bottom-20 right-6 max-w-xs p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm text-left">
            <p className="font-bold">Import Failed</p>
            <p>{importError}</p>
          </div>
        )}
      </div>
    );
  }

  if (isGeneratingBlueprint) {
    return (
      <div className="h-full w-full flex flex-col justify-end p-8 text-center text-stone-300">
        <p>Preparing the story blueprint...</p>
      </div>
    );
  }

  if (!hasBlueprintData) {
    return (
      <div className="h-full w-full flex flex-col justify-end p-8 text-center text-stone-300 space-y-4">
        {blueprintError ? (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-sm text-red-200">
            <p className="font-bold mb-2">Blueprint Failed</p>
            <p>{blueprintError}</p>
            <button
              onClick={() => generateBlueprint(storyState.story_content?.CharacterBlock?.character_details || {})}
              className="mt-4 w-full px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold"
            >
              Retry Blueprint
            </button>
          </div>
        ) : (
          <p>Awaiting the story blueprint... The magic is at work!</p>
        )}
      </div>
    );
  }

  const totalScenes = storyState.story_content.StoryBlueprintBlock.structure.numberOfScenes;
  const hero = storyState.story_content.CharacterBlock.character_details;

  if (showAct2Complete) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold text-stone-100" style={{ fontFamily: 'Cinzel, serif' }}>
          Act II Complete!
        </h2>
        <div className="max-w-md w-full bg-black/40 backdrop-blur-md border border-stone-600 rounded-xl p-6 shadow-2xl">
          <p className="text-stone-300 mb-6">
            The scenes are woven, and the prompts are set. Your story bundle is ready for binding.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleExport}
              className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Story Bundle
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-600"></div>
              <span className="flex-shrink-0 mx-4 text-stone-500 text-sm">THEN</span>
              <div className="flex-grow border-t border-stone-600"></div>
            </div>

            <button
              onClick={() => setActiveTab(2)}
              className="w-full px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg font-medium transition-all"
            >
              Proceed to Act III: Bind Book
            </button>
          </div>
          <div className="mt-6">
            <ProductionChecklist storyState={storyState} />
          </div>
          <div className="mt-6">
            <StoryBlueprintPanel storyState={storyState} />
          </div>
        </div>
      </div>
    );
  }

  const currentScene = storyState.story_content.SceneJSON_array[currentSceneIndex];
  const choiceButtonStyle = "w-full max-w-md text-left p-4 bg-black/20 backdrop-blur-sm border border-stone-500/50 rounded-lg text-stone-200 hover:bg-stone-700/70 hover:border-stone-400 transition-all duration-300 shadow-lg";

  return (
    <div className="h-full w-full flex flex-col justify-end p-8">
      {!currentScene ? (
        <div className="text-center text-stone-300">
          <p>Preparing to spin the tale...</p>
        </div>
      ) : (
        <div className="w-full max-w-md mx-auto space-y-4">
          <div className="bg-black/20 backdrop-blur-sm border border-stone-500/50 rounded-lg p-4 text-stone-200 text-center mb-4">
            <h3 className="text-xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>{currentScene.scene_title}</h3>
            <p className="mt-2 text-stone-300">{currentScene.scene_full_text}</p>
          </div>
          <button
            onClick={() => {
              const nextSceneIndex = currentSceneIndex + 1;
              if (nextSceneIndex < totalScenes) {
                setCurrentSceneIndex(nextSceneIndex);
                generateAndDisplayScene(nextSceneIndex + 1, totalScenes, hero);
              } else {
                setSharedResponse("The weaving is complete! A magnificent tale.");
                setShowAct2Complete(true);
              }
            }}
            className={choiceButtonStyle}
            disabled={isLoading}
          >
            Yes, this scene is perfect!
          </button>
          <button
            className={choiceButtonStyle}
            disabled={isLoading}
          >
            Not quite, let’s refine this scene.
          </button>
          <ProductionChecklist storyState={storyState} />
        </div>
      )}
    </div>
  );
}
