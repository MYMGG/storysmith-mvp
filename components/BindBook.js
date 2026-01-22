// components/BindBook.js

import { useState, useEffect } from 'react';

// The Ledger is now an internal component, styled to fit the new "floating UI"
const LedgerContent = ({ storyState }) => {
  const hero = storyState.story_content?.CharacterBlock?.character_details || {};
  const scenes = storyState.story_content?.SceneJSON_array || [];

  return (
    <div className="w-full max-w-lg mx-auto bg-black/20 backdrop-blur-sm border border-stone-500/50 rounded-lg p-6 text-stone-200 shadow-lg max-h-[60vh] overflow-y-auto custom-scrollbar">
      <h3 className="text-2xl font-bold text-center mb-4" style={{ fontFamily: 'Cinzel, serif' }}>The Grand Ledger</h3>
      
      <div className="border-t border-stone-600/50 pt-4 mt-4">
        <h4 className="text-xl font-bold text-stone-300 mb-2">Hero: {hero.name}</h4>
        <p className="text-stone-300 text-sm">Age: {hero.age}, Gender: {hero.gender}, Traits: {hero.traits}</p>
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

  useEffect(() => {
    // Logic to automatically start this step when the tab becomes active
    const hasAllScenes = storyState.story_content?.SceneJSON_array?.length > 0 && storyState.story_content?.SceneJSON_array?.length === storyState.story_content?.StoryBlueprintBlock?.structure?.numberOfScenes;
    if (hasAllScenes) {
        setSharedResponse("A grand undertaking awaits! The time has come to bind our woven tale. Please review the Grand Ledger.");
        setCurrentBindBookStep(1);
    } else {
        setSharedResponse("The tale is not yet fully spun! Please complete all scenes in the 'Spin Tale' tab before binding your book.");
    }
  }, []);

  const handleFinalize = () => {
    setStoryState(prev => ({ ...prev, story_content: { ...prev.story_content, Cover: { author_attribution: finalAuthor, dedication: finalDedication } } }));
    setSharedResponse("And there you have it! A legend captured, a story born of wonder and heart, now complete!");
    setCurrentBindBookStep(4);
  }
  
  const choiceButtonStyle = "w-full max-w-md text-left p-4 bg-black/20 backdrop-blur-sm border border-stone-500/50 rounded-lg text-stone-200 hover:bg-stone-700/70 hover:border-stone-400 transition-all duration-300 shadow-lg";

  const renderStepContent = () => {
    switch (currentBindBookStep) {
      case 1: // Review Ledger
        return (
          <div className="w-full max-w-lg mx-auto space-y-4">
            <LedgerContent storyState={storyState} />
            <button onClick={() => setCurrentBindBookStep(2)} className={`${choiceButtonStyle} text-center`}>Yes, it's perfect! Let's proceed.</button>
            <button onClick={() => setActiveTab(0)} className={`${choiceButtonStyle} text-center`}>I need to make a change.</button>
          </div>
        );
      case 2: // Author & Dedication
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
        return (
           <div className="w-full max-w-md mx-auto">
                <button onClick={resetApp} className={`${choiceButtonStyle} text-center`}>Start a New Adventure!</button>
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