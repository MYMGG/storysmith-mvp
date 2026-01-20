// components/SpinTale.js

import { useState, useEffect } from 'react';

export default function SpinTale({ storyState, setStoryState, setActiveTab, setSharedResponse, isLoading, isImageLoading }) {
  const [currentSpinTaleStep, setCurrentSpinTaleStep] = useState(0);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);

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
      setStoryState(data);
      setSharedResponse("A blueprint of our tale is prepared! Let us now begin spinning the scenes.");

    } catch (error) {
      console.error("Blueprint generation failed:", error);
      setSharedResponse("The quill has run dry. An error occurred while preparing the tale.");
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  useEffect(() => {
    if (hasHeroData && !hasBlueprintData && !isGeneratingBlueprint) {
      generateBlueprint(storyState.story_content.CharacterBlock.character_details);
    }
  }, [hasBlueprintData, hasHeroData, isGeneratingBlueprint, storyState]);

  useEffect(() => {
    if (hasBlueprintData && hasHeroData && (storyState.story_content.SceneJSON_array?.length || 0) === 0) {
      setTimeout(() => {
        generateAndDisplayScene(1, storyState.story_content.StoryBlueprintBlock.structure.numberOfScenes, storyState.story_content.CharacterBlock.character_details);
      }, 1500);
    }
  }, [hasBlueprintData, hasHeroData, storyState]);


  if (!hasHeroData) {
    setSharedResponse("It seems our story's hero or blueprint is not yet forged! Please return to the 'Forge Hero' tab to begin your adventure.");
    return null;
  }

  if (isGeneratingBlueprint) {
    return (
      <div className="h-full w-full flex flex-col justify-end p-8 text-center text-stone-300">
        <p>Preparing the story blueprint...</p>
      </div>
    );
  }

  if (!hasBlueprintData) {
    // This state is now handled by the isGeneratingBlueprint check above.
    // This return is a safety net but should not be reached with the fix.
    return (
      <div className="h-full w-full flex flex-col justify-end p-8 text-center text-stone-300">
        <p>Awaiting the story blueprint... The magic is at work!</p>
      </div>
    );
  }

  const totalScenes = storyState.story_content.StoryBlueprintBlock.structure.numberOfScenes;
  const hero = storyState.story_content.CharacterBlock.character_details;
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
                setActiveTab(2);
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
        </div>
      )}
    </div>
  );
}