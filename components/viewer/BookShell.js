/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { useBookState } from '../../hooks/useBookState';

// Theme token maps
const THEME_TOKENS = {
    day: {
        '--bg-canvas': '#f5f5f4',
        '--bg-surface': '#ffffff',
        '--text-primary': '#1c1917',
        '--text-secondary': '#57534e',
        '--accent': '#b45309'
    },
    night: {
        '--bg-canvas': '#1c1917',
        '--bg-surface': '#292524',
        '--text-primary': '#e7e5e4',
        '--text-secondary': '#a8a29e',
        '--accent': '#d97706'
    },
    lamp: {
        '--bg-canvas': '#fef3c7',
        '--bg-surface': '#fffbeb',
        '--text-primary': '#451a03',
        '--text-secondary': '#78350f',
        '--accent': '#92400e'
    }
};

export default function BookShell({ children, bookTitle, bookId, storyState }) {
    const {
        state,
        fullState,
        setMode,
        setTheme,
        setVellumExpanded,
        setVellumPosition,
        setFontScale,
        setFlag,
        resetProgress,
        setCurrentIndex,
        isLoaded,
        setStoryState: persistStoryState
    } = useBookState(bookId);

    const { mode, theme, vellumExpanded, vellumPosition, fontScale, flags, currentIndex } = state;

    const [chromeVisible, setChromeVisible] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [tocOpen, setTocOpen] = useState(false);
    const [activeTheme, setActiveTheme] = useState('night');

    // Persist storyState to localStorage on mount (once, if not already stored)
    const hasPersistedRef = useRef(false);
    useEffect(() => {
        if (isLoaded && storyState && !fullState.story_state && !hasPersistedRef.current) {
            const { logCurrentStationIfDev } = require("../../lib/stations/devStationDebug");
            // Dev-only observability: viewer entry/persist moment
            logCurrentStationIfDev({ routePath: `/viewer/${bookId}` });
            persistStoryState(storyState);
            hasPersistedRef.current = true;
        }
    }, [isLoaded, storyState, fullState.story_state, persistStoryState]);

    const chromeTimeoutRef = useRef(null);

    const showChrome = () => {
        setChromeVisible(true);
        if (chromeTimeoutRef.current) clearTimeout(chromeTimeoutRef.current);
        chromeTimeoutRef.current = setTimeout(() => {
            if (!settingsOpen && !tocOpen) {
                setChromeVisible(false);
            }
        }, 3000);
    };

    useEffect(() => {
        showChrome();
        const handleActivity = () => showChrome();
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('touchstart', handleActivity);
        window.addEventListener('keydown', handleActivity);
        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            if (chromeTimeoutRef.current) clearTimeout(chromeTimeoutRef.current);
        };
    }, [settingsOpen, tocOpen]);

    // Determine active theme (system or explicit)
    useEffect(() => {
        if (!isLoaded) return;

        if (theme === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setActiveTheme(systemDark ? 'night' : 'day');

            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => setActiveTheme(mediaQuery.matches ? 'night' : 'day');
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        } else {
            setActiveTheme(theme);
        }
    }, [theme, isLoaded]);

    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                mode, setMode,
                theme, setTheme,
                chromeVisible, setChromeVisible,
                settingsOpen, setSettingsOpen,
                tocOpen, setTocOpen,
                vellumExpanded, setVellumExpanded,
                vellumPosition, setVellumPosition,
                fontScale, setFontScale,
                resetProgress,
                flags, setFlag,
                currentIndex, setCurrentIndex
            });
        }
        return child;
    });

    const themeStyles = THEME_TOKENS[activeTheme] || THEME_TOKENS.night;

    return (
        <div
            className="min-h-screen relative overflow-hidden transition-colors duration-500"
            style={{
                backgroundColor: themeStyles['--bg-canvas'],
                color: themeStyles['--text-primary'],
                ...themeStyles
            }}
        >
            <header
                className={`absolute top-0 w-full p-4 flex justify-between items-center z-40 transition-opacity duration-300 ${chromeVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)' }}
            >
                <button onClick={() => setTocOpen(true)} className="flex items-center gap-2 group">
                    <span className="text-xl font-bold font-cinzel text-amber-500/90 group-hover:text-amber-400 transition-colors">StorySmith</span>
                    {bookTitle && <span className="text-stone-300 text-sm italic group-hover:text-white transition-colors border-l border-stone-600 pl-2 ml-2">{bookTitle}</span>}
                </button>

                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => setMode(mode === 'storybook' ? 'reader' : 'storybook')}
                        className="px-3 py-1 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-xs text-stone-300 border border-white/10 transition-all font-bold uppercase tracking-wider"
                    >
                        {mode}
                    </button>

                    <button
                        onClick={() => setTheme(theme === 'day' ? 'night' : theme === 'night' ? 'lamp' : 'day')}
                        className="w-8 h-8 rounded-full bg-stone-800/80 flex items-center justify-center text-amber-500 hover:bg-stone-700 transition-all border border-stone-600"
                        title="Toggle Theme"
                    >
                        ☀
                    </button>

                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="text-stone-300 hover:text-white transition-colors"
                    >
                        ⚙
                    </button>
                </div>
            </header>

            <main className="w-full h-full absolute inset-0">
                {!isLoaded ? <div className="absolute inset-0 bg-stone-900 z-50 transition-opacity" /> : childrenWithProps}
            </main>

        </div>
    );
}
