// pages/index.js

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LandingPage from '../components/LandingPage';
import ForgeHero from '../components/ForgeHero';
import SpinTale from '../components/SpinTale';
import BindBook from '../components/BindBook';
import BookSpread from '../components/BookSpread';
import TranslucentHeader from '../components/TranslucentHeader';
import ActsBar from '../components/ActsBar';
import { BookOpen } from 'lucide-react';
import useAdminAuth from '../hooks/useAdminAuth';
import { createEmptyStoryState } from '../lib/storyState.js';

/**
 * Create a fresh StoryState with unique session_id using the canonical factory.
 * Overrides visual_style to default "3D animated Film" for StorySmith.
 */
function createInitialStoryState() {
  return createEmptyStoryState({
    story_data: {
      visual_style: "3D animated Film",
    },
  });
}

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [showLandingPage, setShowLandingPage] = useState(true);

  // Check for existing session - only auto-login if not explicitly returning home
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('ss_admin_authed_v1') === '1') {
      // Only set false if showLandingPage hasn't been explicitly set to true by goHome event
      if (!sessionStorage.getItem('ss_go_home_pending')) {
        setShowLandingPage(false);
      } else {
        sessionStorage.removeItem('ss_go_home_pending');
      }
    }
  }, []);

  const [activeTab, setActiveTab] = useState(0);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [storyState, setStoryState] = useState(() => createInitialStoryState());
  const [sharedResponse, setSharedResponse] = useState("");
  const bookRef = useRef(null);
  const bookElRef = useRef(null); // DOM ref for measuring BookSpread position
  const headerRef = useRef(null);
  const mainRef = useRef(null);
  const [actsBarTop, setActsBarTop] = useState(80); // Initial estimate
  const pendingAdvanceRef = useRef(null); // Queue for deferred ForgeHero state changes
  const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '6425';

  const {
    showPasswordInput,
    setShowPasswordInput,
    adminPasswordInput,
    setAdminPasswordInput,
    handleAdminLogin,
  } = useAdminAuth(password, () => {
    // Redirect to projects page on successful login
    router.push('/projects');
  });

  // Dev shortcut: Enable jumping directly to Act III via ?act=3
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('act') === '3' || params.get('tab') === '2') {
        setShowLandingPage(false);
        setActiveTab(2);
      }
    }
  }, []);

  // This is the correct array that the application should be using
  const tabs = [
    { label: 'Forge Hero', videoSrc: '/videos/Keeper1.mp4', bgSrc: '/background1.jpg' },
    { label: 'Spin Tale', videoSrc: '/videos/Keeper2.mp4', bgSrc: '/background2.jpg' },
    { label: 'Bind Book', videoSrc: '/videos/Keeper3.mp4', bgSrc: '/background3.jpg' },
  ];

  const handleSignUpSubmit = (e) => { /* ... */ };

  const resetApp = () => {
    setStoryState(createInitialStoryState());
    setActiveTab(0);
    setShowLandingPage(true);
    setSharedResponse("");
  };

  // Listen for cross-page "go home" event to trigger landing state
  useEffect(() => {
    const handler = () => resetApp();
    window.addEventListener('ss_go_home', handler);
    return () => window.removeEventListener('ss_go_home', handler);
  }, []);

  // Dynamically center ActsBar in the gap between header and BOOK top
  useLayoutEffect(() => {
    const calculateActsBarPosition = () => {
      if (headerRef.current && bookElRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        const bookTop = bookElRef.current.getBoundingClientRect().top;
        if (bookTop <= headerBottom) return; // Guard against invalid layout
        const gapMid = headerBottom + (bookTop - headerBottom) / 2;
        setActsBarTop(gapMid);
      }
    };
    calculateActsBarPosition();
    window.addEventListener('resize', calculateActsBarPosition);
    return () => window.removeEventListener('resize', calculateActsBarPosition);
  }, [showLandingPage]);

  const renderAppInterface = () => (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden" style={{ fontFamily: 'Lato, sans-serif' }}>
      {/* Dynamic Background System */}
      <div className="absolute inset-0 z-0">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url('${tab.bgSrc}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              opacity: activeTab === index ? 1 : 0,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 z-1 bg-black/50" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <div ref={headerRef}>
          <TranslucentHeader
            onHomeClick={resetApp}
            rightSlot={
              <button
                onClick={() => router.push('/projects')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-parchment-deep/60 text-stone-100 hover:bg-parchment-deep/80 transition font-heading"
              >
                <BookOpen className="w-4 h-4" />
                Library
              </button>
            }
          />
        </div>

        {/* Floating Acts Bar - dynamically centered in gap */}
        <div
          className="fixed left-0 right-0 z-20 pointer-events-none"
          style={{ top: actsBarTop, transform: 'translateY(-50%)' }}
        >
          <ActsBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <main ref={mainRef} className="flex-1 flex items-center justify-center p-4">
          {/* Act 1 (Forge): Full-width 2-page book layout */}
          {activeTab === 0 && (
            <div ref={bookElRef} className="w-full h-full flex items-center justify-center">
              <BookSpread
                ref={bookRef}
                left={
                  <video
                    key={tabs[activeTab].videoSrc}
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src={tabs[activeTab].videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                }
                leftSubtitle={sharedResponse}
                right={
                  <ForgeHero
                    embedded
                    storyState={storyState}
                    setStoryState={setStoryState}
                    setActiveTab={setActiveTab}
                    setSharedResponse={setSharedResponse}
                    sharedResponse={sharedResponse}
                    onAdvanceRequested={(fn) => {
                      pendingAdvanceRef.current = fn;
                      bookRef.current?.triggerFlip();
                    }}
                  />
                }
                onFlipMidpoint={() => {
                  pendingAdvanceRef.current?.();
                  pendingAdvanceRef.current = null;
                }}
              />
            </div>
          )}
          {/* Act 2 + 3: Original 50/50 layout (to be converted later) */}
          {activeTab !== 0 && (
            <div className="flex-1 flex flex-col md:flex-row gap-8 items-stretch w-full max-w-screen-2xl">
              <div className="relative flex-grow w-full md:w-1/2 min-h-0 rounded-2xl shadow-2xl overflow-hidden">
                <video
                  key={tabs[activeTab].videoSrc}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src={tabs[activeTab].videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="flex-grow w-full md:w-1/2 flex justify-center items-center">
                {activeTab === 1 && <SpinTale storyState={storyState} setStoryState={setStoryState} setActiveTab={setActiveTab} setSharedResponse={setSharedResponse} />}
                {activeTab === 2 && <BindBook storyState={storyState} setStoryState={setStoryState} setActiveTab={setActiveTab} setSharedResponse={setSharedResponse} resetApp={resetApp} />}
              </div>
            </div>
          )}
        </main>
      </div>
    </div >
  );

  return (
    <>
      <Head>
        <title>StorySmith - Your Imagination, Illustrated</title>
        {/* Head content... */}
      </Head>
      {showLandingPage ? (
        <LandingPage
          email={email}
          setEmail={setEmail}
          isVideoFinished={isVideoFinished}
          setIsVideoFinished={setIsVideoFinished}
          handleSignUpSubmit={handleSignUpSubmit}
          showPasswordInput={showPasswordInput}
          setShowPasswordInput={setShowPasswordInput}
          adminPasswordInput={adminPasswordInput}
          setAdminPasswordInput={setAdminPasswordInput}
          handleAdminLogin={handleAdminLogin}
        />
      ) : renderAppInterface()}
    </>
  );
}