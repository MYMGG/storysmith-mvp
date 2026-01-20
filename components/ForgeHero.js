// components/ForgeHero.js

import { useState, useEffect } from 'react';
import { conversation } from './forgeHeroContent';
import useForgeHeroApis from '../hooks/useForgeHeroApis';
import { useStory } from '../context/StoryContext';

export default function ForgeHero({
  storyState,
  setStoryState,
  setActiveTab,
  setSharedResponse,
  sharedResponse,
}) {
  const { apiKeys } = useStory();
  const [currentForgeHeroStep, setCurrentForgeHeroStep] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('start');
  const [userProvidedName, setUserProvidedName] = useState('');
  const [userProvidedAge, setUserProvidedAge] = useState('');

  const [heroDetails, setHeroDetails] = useState({
    type: '', name: '', age: '', gender: '', traits: 'brave and kind', wardrobe: '', signatureItem: '', photoFile: null,
  });

  const {
    isImageLoading_local,
    isNameLoading,
    isHeroSurpriseLoading,
    heroImageUrl,
    setHeroImageUrl,
    generatedName,
    setGeneratedName,
    suggestedNames,
    setSuggestedNames,
    surpriseHeroDetails,
    setSurpriseHeroDetails,
    generateRealImage,
    generateAIName,
    generateSuggestedNames,
    generateSurpriseHero,
  } = useForgeHeroApis(heroDetails, setSharedResponse);

  useEffect(() => {
    if (currentForgeHeroStep === 0) {
      setSharedResponse("Welcome, brave adventurer! To begin our grand tale, tell me, from where shall our hero emerge?");
    }
  }, [currentForgeHeroStep, setSharedResponse]);

  const handlePhotoFileChange = async (event) => { /* ... */ };

  const handleHeroTypeSelection = (type) => {
    setHeroDetails(prev => ({ ...prev, type }));
    if (type === 'real') {
      setCurrentForgeHeroStep(1);
      setSharedResponse("How marvelous! A legend in the making!");
    } else if (type === 'fictional') {
      setCurrentForgeHeroStep(2);
      setCurrentQuestion('name');
    } else if (type === 'surprise') {
      generateSurpriseHero('fictional');
      setSharedResponse("A hero, conjured from the void!");
    }
  };

  const handleQuestionAnswer = (field, value, nextQuestion) => {
    setHeroDetails(prev => ({ ...prev, [field]: value }));
    setCurrentQuestion(nextQuestion);
  };

  const handleNameConfirmation = (name) => {
    handleQuestionAnswer('name', name, 'age');
    setGeneratedName('');
  };

  const handleSuggestedNameSelection = (name) => {
    handleQuestionAnswer('name', name, 'age');
    setSuggestedNames([]);
  };

  const constructHeroPrompt = (details) => {
    const { name, age, gender, traits, wardrobe, signatureItem } = details;
    let prompt = `${name || 'A young hero'}, a ${age || '7'}-year-old ${gender || 'child'} with ${traits || 'brave and curious'} traits, wearing ${wardrobe || 'a simple tunic and sturdy boots'}, holding ${signatureItem || 'a magical locket'}.`;
    prompt += " Style: 3D animated Film, Consistency Tag: whimsical_fantasy_child, Format: full body, front-facing. Lighting: soft cinematic. Rendered as a 3D animated film.";
    let negativePrompt = " no text, no captions, no writing, no labels, no words";
    prompt += negativePrompt;
    return prompt;
  };

  const handleForgeHeroSubmit = (details = heroDetails) => {
    const prompt = constructHeroPrompt(details);
    setSharedResponse("Behold, the hero’s face shines with living light!");
    generateRealImage(prompt);
    setCurrentForgeHeroStep(3);
  };

  const handleForgeHeroCompletion = () => {
    setStoryState(prev => ({
      ...prev,
      story_content: {
        ...prev.story_content,
        CharacterBlock: {
          character_details: heroDetails,
          character_image: heroImageUrl,
        }
      }
    }));

    setSharedResponse("🎉 Your hero is forged! The first chapter of creation is complete! 🎉");
    setTimeout(() => {
      setActiveTab(1);
    }, 1500);
  };

  const choiceButtonStyle = "w-full text-left p-4 bg-black/10 border border-black/20 rounded-lg text-stone-800 hover:bg-black/20 transition-all duration-300 shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed";

  const renderConversationalForm = () => {
    if (generatedName) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-stone-800 text-lg font-bold">The name born of magic is:</p>
          <p className="text-4xl font-extrabold text-amber-700" style={{ fontFamily: 'Cinzel, serif' }}>{generatedName}</p>
          <button onClick={() => handleNameConfirmation(generatedName)} className={choiceButtonStyle}>Yes, that's perfect!</button>
          <button onClick={() => setGeneratedName('')} className={choiceButtonStyle}>Not quite, let's try again.</button>
        </div>
      );
    }

    if (currentQuestion === 'name_suggestions') {
      if (isNameLoading) {
        setSharedResponse("The winds of inspiration whisper... what names shall they carry?");
        return (
          <div className="flex justify-center items-center h-[200px]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stone-400"></div></div>
        );
      }
      setSharedResponse(conversation.name_suggestions.question);
      return (
        <div className="flex flex-col items-center space-y-4">
          {suggestedNames.map((name, index) => (
            <button key={index} className={choiceButtonStyle} onClick={() => handleSuggestedNameSelection(name)}>
              {name}
            </button>
          ))}
          <button className={choiceButtonStyle} onClick={() => setCurrentQuestion('name')}>
            None of these, let's go back.
          </button>
        </div>
      );
    }

    const currentStep = conversation[currentQuestion];
    if (currentStep) {
      setSharedResponse(currentStep.question);
      const gridClass = currentStep.choices.some(c => c.gridCols) ? 'grid grid-cols-2 gap-4' : 'flex flex-col items-center space-y-4';

      return (
        <div className={gridClass}>
          {currentStep.choices.map((choice, index) => (
            <button
              key={index}
              className={`${choiceButtonStyle} ${choice.gridCols ? `col-span-${choice.gridCols}` : ''}`}
              onClick={() => {
                if (choice.action) {
                  if (choice.action === 'ai_whimsical' || choice.action === 'ai_surprise') {
                    generateAIName(choice.action.split('_')[1]);
                  } else if (choice.action === 'name_suggestions') {
                    generateSuggestedNames();
                  }
                  setCurrentQuestion(choice.action);
                } else {
                  handleQuestionAnswer(choice.field, choice.value, choice.next);
                }
              }}
            >
              {choice.text}
            </button>
          ))}
        </div>
      );
    } else if (currentQuestion === 'name') {
      setSharedResponse(conversation.name.question);
      const gridClass = conversation.name.choices.some(c => c.gridCols) ? 'grid grid-cols-2 gap-4' : 'flex flex-col items-center space-y-4';
      return (
        <div className={gridClass}>
          {conversation.name.choices.map((choice, index) => (
            <button
              key={index}
              className={`${choiceButtonStyle} ${choice.gridCols ? `col-span-${choice.gridCols}` : ''}`}
              onClick={() => {
                if (choice.action) {
                  if (choice.action === 'ai_whimsical' || choice.action === 'ai_surprise') {
                    generateAIName(choice.action.split('_')[1]);
                  } else if (choice.action === 'name_suggestions') {
                    generateSuggestedNames();
                  }
                  setCurrentQuestion(choice.action);
                } else {
                  handleQuestionAnswer('name', choice.value, choice.next);
                }
              }}
            >
              {choice.text}
            </button>
          ))}
        </div>
      );
    }

    if (isNameLoading) {
      return (
        <div className="flex justify-center items-center h-[200px]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stone-400"></div></div>
      );
    }

    switch (currentQuestion) {
      case 'name_provide':
        setSharedResponse("A wonderful choice! Please, share the name with me.");
        return (
          <div className="flex flex-col items-center space-y-4">
            <input type="text" value={userProvidedName} onChange={(e) => setUserProvidedName(e.target.value)} className="w-full p-3 rounded-lg bg-white/50 text-stone-800 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-500 border border-stone-400" placeholder="Enter hero's name..." />
            <button className={choiceButtonStyle} onClick={() => handleQuestionAnswer('name', userProvidedName, 'age')}>Confirm Name</button>
          </div>
        );
      case 'age_provide':
        setSharedResponse("Wonderful! How old is our hero?");
        return (
          <div className="flex flex-col items-center space-y-4">
            <input type="number" value={userProvidedAge} onChange={(e) => setUserProvidedAge(e.target.value)} className="w-full p-3 rounded-lg bg-white/50 text-stone-800 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-500 border border-stone-400" placeholder="Enter hero's age..." />
            <button className={choiceButtonStyle} onClick={() => handleQuestionAnswer('age', userProvidedAge, 'gender')}>Confirm Age</button>
          </div>
        );
      case 'traits':
        setSharedResponse("With our hero's core details captured, we are ready to forge their portrait!");
        return (
          <div className="text-center">
            <p className="text-stone-700 mb-6">All details collected! Ready to generate the hero's portrait.</p>
            <button onClick={() => handleForgeHeroSubmit()} className={`${choiceButtonStyle} text-center`} disabled={isImageLoading_local}>
              {isImageLoading_local ? 'Forging Hero...' : 'Forge My Hero!'}
            </button>
          </div>
        );
      default:
        // Fallback for unhandled states
        return <div className="text-center text-stone-700">An unexpected state has occurred. Please refresh the page.</div>;
    }
  }

  const renderStepContent = () => {
    if (isHeroSurpriseLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <p className="text-stone-300 mb-4">A hero, conjured from the void!</p>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stone-400 mx-auto"></div>
          </div>
        </div>
      );
    }

    if (surpriseHeroDetails) {
      setSharedResponse("Behold! A magnificent hero has appeared! Do these details sing true to your heart?");
      return (
        <div className="text-center space-y-4">
          <p className="text-stone-800 text-lg font-bold" style={{ fontFamily: 'Cinzel, serif' }}>{surpriseHeroDetails.name}, the {surpriseHeroDetails.gender}</p>
          <p className="text-stone-700 text-sm">{surpriseHeroDetails.age}-years-old, {surpriseHeroDetails.traits.join(', ')}</p>
          <p className="text-stone-700 text-sm">Wearing: {surpriseHeroDetails.wardrobe}</p>
          <p className="text-stone-700 text-sm">Holding: {surpriseHeroDetails.signature_item}</p>
          <button onClick={() => {
            setHeroDetails(surpriseHeroDetails);
            setSurpriseHeroDetails(null);
            handleForgeHeroSubmit(surpriseHeroDetails);
          }} className={choiceButtonStyle}>Yes, that’s perfect!</button>
          <button onClick={() => {
            setSurpriseHeroDetails(null);
            setCurrentForgeHeroStep(0);
          }} className={choiceButtonStyle}>Not quite, let's go back.</button>
        </div>
      );
    }

    switch (currentForgeHeroStep) {
      case 0:
        return (
          <div className="space-y-4">
            <button onClick={() => handleHeroTypeSelection('real')} className={choiceButtonStyle}>A real person I know or love</button>
            <button onClick={() => handleHeroTypeSelection('fictional')} className={choiceButtonStyle}>A brand new hero, born from imagination!</button>
            <button onClick={() => handleHeroTypeSelection('surprise')} className={choiceButtonStyle}>Surprise me, StorySmith!</button>
          </div>
        );
      case 1:
        return (
          <div className="w-full">
            <label htmlFor="photo-upload" className={`${choiceButtonStyle} cursor-pointer block text-center`}>
              Upload a Photograph
            </label>
            <input type="file" id="photo-upload" accept="image/*" onChange={handlePhotoFileChange} className="hidden" />
          </div>
        );
      case 2:
        return renderConversationalForm();
      case 3:
        return (
          <div className="text-center">
            {isImageLoading_local ? (
              <div className="flex justify-center items-center h-[300px]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stone-400"></div></div>
            ) : heroImageUrl ? (
              <div>
                <img src={heroImageUrl} alt="Generated Hero Portrait" className="rounded-lg shadow-2xl mb-6" />
                <div className="space-y-4">
                  <button onClick={() => handleForgeHeroCompletion()} className={choiceButtonStyle}>Yes, that’s perfect!</button>
                  <button onClick={() => {
                    setHeroImageUrl('');
                    setCurrentForgeHeroStep(2);
                    setCurrentQuestion('name');
                  }} className={choiceButtonStyle}>Not quite, let’s refine.</button>
                </div>
              </div>
            ) : (<p className="text-stone-700">An error occurred during image generation.</p>)}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div
      className="w-full max-w-lg mx-auto h-full max-h-[80vh] flex flex-col p-8 rounded-lg shadow-2xl"
      style={{
        backgroundColor: 'rgba(245, 240, 232, 0.9)',
        color: '#4f463c',
        fontFamily: '"Cinzel", serif',
        border: '2px solid #D1C7B8',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        id="shared-response-box-parchment"
        className="w-full text-center text-xl mb-8 p-4 border-b-2 border-stone-400/50"
      >
        {sharedResponse}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        {renderStepContent()}
      </div>
    </div>
  );
}