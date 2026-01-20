import { useState, useEffect } from 'react';
import ApiKeyManager from './ApiKeyManager';

export default function LandingPage({ email, setEmail, showLandingPage, setShowLandingPage, isVideoFinished, setIsVideoFinished, handleSignUpSubmit, showPasswordInput, setShowPasswordInput, adminPasswordInput, setAdminPasswordInput, handleAdminLogin }) {
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const handleVideoEnd = () => {
    setIsVideoFinished(true);
  };

  return (
    <div className="relative h-screen w-screen bg-black">
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

          <h2 className="text-5xl font-bold mb-4 tracking-wider" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>
            StorySmith
          </h2>

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

        </div>
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
      {showPasswordInput ? (
        <div className="absolute bottom-5 right-5 flex items-center space-x-2 z-20">
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
        </div>
      ) : (
        <button
          onClick={() => setShowPasswordInput(true)}
          className="absolute bottom-5 right-5 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-50 hover:opacity-100 transition-opacity z-20"
        >
          Admin
        </button>
      )}

      {/* Settings (Gear Icon) Button */}
      <button
        onClick={() => setShowApiKeyManager(true)}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-xs px-3 py-2 rounded opacity-50 hover:opacity-100 transition-opacity z-20 flex items-center gap-2"
        title="Manage API Key"
      >
        ⚙️ Settings
      </button>

      {/* API Key Manager Modal */}
      <ApiKeyManager isOpen={showApiKeyManager} onClose={() => setShowApiKeyManager(false)} />
    </div>
  );
}