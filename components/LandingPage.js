import { useState, useEffect } from 'react';
import { useStory } from '../context/StoryContext';
import { Button } from './ui/button';

export default function LandingPage() {
  const {
    email,
    setEmail,
    handleSignUpSubmit,
    showPasswordInput,
    setShowPasswordInput,
    adminPasswordInput,
    setAdminPasswordInput,
    handleAdminLogin,
    isAdminAuthenticated,
    enterApp,
    apiKeys,
    saveApiKey
  } = useStory();

  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [localOpenAIKey, setLocalOpenAIKey] = useState(apiKeys.openai);
  const [localGoogleKey, setLocalGoogleKey] = useState(apiKeys.google);

  // Sync local state with context state when it changes
  useEffect(() => {
    setLocalOpenAIKey(apiKeys.openai);
    setLocalGoogleKey(apiKeys.google);
  }, [apiKeys]);

  const handleVideoEnd = () => {
    setIsVideoFinished(true);
  };

  const handleSaveKeys = () => {
    saveApiKey('openai', localOpenAIKey);
    saveApiKey('google', localGoogleKey);
    alert('Keys saved!');
  };

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      {/* The main content area */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('/background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isVideoFinished ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center justify-center h-full text-center text-white p-4 bg-black bg-opacity-40">

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

          <hr className="w-24 border-t-2 border-amber-300 opacity-60 mb-8" />

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8' }}>
            Your Story, Magically Told.
          </h1>

          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-lg md:text-xl" style={{ fontFamily: 'Lato, sans-serif', color: '#EAE0D5' }}>
              StorySmith is your guide on a fun, creative journey to turn your ideas—or a loved one's photo—into a beautifully illustrated, professional storybook.
            </p>
            <p className="text-xl md:text-2xl font-semibold" style={{ fontFamily: 'Lato, sans-serif', color: '#F5F0E8' }}>
              The power of AI, made simple for everyone.
            </p>
          </div>

          {!isAdminAuthenticated && (
            <form onSubmit={handleSignUpSubmit} className="flex flex-col sm:flex-row items-center w-full max-w-lg space-y-4 sm:space-y-0 sm:space-x-4 mt-8 px-4 sm:px-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 p-2 sm:p-3 rounded-lg text-gray-800 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-amber-700 text-white font-bold rounded-lg shadow-md hover:bg-amber-800 transition duration-300"
              >
                Notify Me!
              </button>
            </form>
          )}

  return (
    <section className="relative flex items-center justify-center h-screen bg-gradient-to-b from-purple-800 to-indigo-900 text-white">
      <div className="absolute inset-0 opacity-30">
        {/* Background video or image can go here */}
      </div>
      {/* The promo video that plays on top */}
      <video
        className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-out"
        style={{
          opacity: isVideoFinished ? 0 : 1,
          pointerEvents: isVideoFinished ? 'none' : 'auto'
        }}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        src="/promo.mp4"
      >
        Your browser does not support the video tag.
      </video>

      {/* NEW: Skip Intro Button */}
      {!isVideoFinished && (
        <button
          onClick={() => setIsVideoFinished(true)}
          className="absolute bottom-5 left-5 z-20 px-4 py-2 text-sm font-semibold text-white bg-black bg-opacity-50 rounded-lg shadow-md hover:bg-opacity-60 transition-all duration-300"
        >
          Skip Intro
        </button>
      )}

      {/* Admin Button and Password Field */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col items-end space-y-2">
        {isAdminAuthenticated ? (
          <div className="bg-black/80 p-4 rounded-lg text-white space-y-3 w-80 backdrop-blur-md border border-amber-500/30">
            <h3 className="text-amber-500 font-bold mb-2">Admin Settings</h3>

            <div className="space-y-1">
              <label className="text-xs text-stone-300">OpenAI API Key</label>
              <input
                type="password"
                value={localOpenAIKey}
                onChange={(e) => setLocalOpenAIKey(e.target.value)}
                className="w-full text-xs p-2 bg-stone-900 border border-stone-700 rounded text-amber-100"
                placeholder="sk-..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-stone-300">Google Gemini API Key</label>
              <input
                type="password"
                value={localGoogleKey}
                onChange={(e) => setLocalGoogleKey(e.target.value)}
                className="w-full text-xs p-2 bg-stone-900 border border-stone-700 rounded text-amber-100"
                placeholder="AIza..."
              />
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={handleSaveKeys} className="px-3 py-1 bg-green-700 rounded text-xs hover:bg-green-600">Save Keys</button>
              <button onClick={enterApp} className="px-3 py-1 bg-amber-700 rounded text-xs hover:bg-amber-600 font-bold">Launch App</button>
            </div>
          </div>
        ) : showPasswordInput ? (
          <div className="flex items-center space-x-2">
            <input
              type="password"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdminLogin();
                }
              }}
              placeholder="Enter password"
              className="p-1 text-xs rounded bg-black bg-opacity-50 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              onClick={handleAdminLogin}
              className="px-2 py-1 text-xs rounded bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors"
            >
              Go
            </button>
            <button
              onClick={() => setShowPasswordInput(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              x
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPasswordInput(true)}
            className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-50 hover:opacity-100 transition-opacity"
          >
            Admin
          </button>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
