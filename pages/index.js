import React, { useEffect } from 'react';
import Head from 'next/head';
import { useStory } from '../context/StoryContext';
import useTypewriter from '../hooks/useTypewriter';
import KeeperMessage from '../components/KeeperMessage';
import LandingPage from './components/LandingPage';
import ForgeHero from './components/ForgeHero';
import SpinTale from './components/SpinTale';
import BindBook from './components/BindBook';

export default function Home() {
  const { showLandingPage, activeTab, sharedResponse } = useStory();
  const keeperDialogue = useTypewriter(sharedResponse, 40);

  // Focus the first interactive element after Keeper finishes typing
  useEffect(() => {
    if (!showLandingPage && keeperDialogue === sharedResponse) {
      const firstBtn = document.querySelector('main button');
      if (firstBtn) {
        firstBtn.focus();
      }
    }
  }, [keeperDialogue, sharedResponse, showLandingPage]);

  const renderAppInterface = () => {
    switch (activeTab) {
      case 0:
        return <ForgeHero />;
      case 1:
        return <SpinTale />;
      case 2:
        return <BindBook />;
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>StorySmith</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative min-h-screen flex flex-col items-center justify-center text-stone-200">
        <video
          src={showLandingPage ? '/Keeper1.mp4' : `/Keeper${activeTab + 1}.mp4`}
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000"
          autoPlay
          loop
          muted
        />
        <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm z-10" />

        <main className="relative z-20 flex flex-col items-center justify-center w-full max-w-4xl px-4 py-8">
          <div className="text-center mb-10">
            {!showLandingPage && (
              <h1 className="text-5xl font-bold font-serif text-amber-300 drop-shadow-lg leading-tight">
                The StorySmith
              </h1>
            )}
          </div>

          {showLandingPage ? (
            <LandingPage />
          ) : (
            <>
              <KeeperMessage text={keeperDialogue} />
              <div className="w-full max-w-lg">
                {renderAppInterface()}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
