// components/BindBook.js

import { useState, useEffect } from 'react';
import { importBundle } from '../lib/bundleImporter';

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

  // Check if we have valid scene data to proceed
  const hasValidSceneData = storyState.story_content?.SceneJSON_array?.length > 0;

  useEffect(() => {
    // If we already have scene data, advance to step 1 (review)
    if (hasValidSceneData) {
      setSharedResponse("A grand undertaking awaits! The time has come to bind our woven tale. Please review the Grand Ledger.");
      setCurrentBindBookStep(1);
    } else {
      // Stay on step 0 and prompt for import
      setSharedResponse("Welcome to Act III! Please import your Story Bundle from Act II to continue.");
    }
  }, [hasValidSceneData]);

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
                To bind your story, please present your Story Bundle from Act II.
              </p>

              <div className="space-y-4">
                <label
                  className="block w-full cursor-pointer group"
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                >
                  <div className="w-full flex items-center justify-center px-6 py-4 border-2 border-dashed border-stone-600 rounded-lg group-hover:border-amber-500/50 transition-colors">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-stone-400 group-hover:text-amber-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-sm text-stone-300">
                        <span className="font-medium text-amber-500 group-hover:text-amber-400">Upload a file</span>
                        <span className="pl-1">or drag and drop</span>
                      </div>
                      <p className="text-xs text-stone-500">MyStoryAssetBundle_Part2.json</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    disabled={isImporting}
                  />
                </label>

                {isImporting && (
                  <p className="text-amber-400 text-sm">Reading the scroll...</p>
                )}

                {importError && (
                  <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm text-left">
                    <p className="font-bold mb-1">Import Failed</p>
                    <ul className="list-disc list-inside space-y-1">
                      {importError.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setActiveTab(1)}
                  className="w-full px-4 py-2 text-stone-400 hover:text-stone-200 text-sm transition-colors"
                >
                  ← Back to Act II
                </button>
              </div>
            </div>
          </div>
        );
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