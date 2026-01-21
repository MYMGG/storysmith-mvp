import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing book viewer state with localStorage persistence.
 * Uses a StoryState-like envelope structure for consistency with the canonical schema.
 * Backward compatible with previous flat storage format.
 */
export function useBookState(bookId, initialState = {}) {
    // StoryState-like envelope with viewer_session for UI preferences
    const defaults = {
        version: 2, // Bumped version for new schema
        metadata: {
            session_id: bookId ? `viewer_${bookId}` : null,
            last_updated: Date.now()
        },
        viewer_session: {
            currentIndex: 0,
            mode: 'storybook',
            theme: 'system',
            followSystem: true,
            reducedMotion: false,
            fontScale: 1,
            vellumExpanded: true,
            vellumPosition: { x: 0, y: 0 },
            flags: {},
            bookmarks: [],
            ...initialState
        },
        story_state: null // Canonical StoryState will be stored here
    };

    const [state, setState] = useState(defaults);
    const [isLoaded, setIsLoaded] = useState(false);

    /**
     * Migrate old flat format to new envelope format.
     */
    const migrateOldFormat = (parsed) => {
        // If it has viewer_session, it's already new format - preserve story_state if present
        if (parsed.viewer_session) {
            return {
                ...defaults,
                ...parsed,
                story_state: parsed.story_state || null
            };
        }

        // Old format had fields at root level - migrate them
        const { version, lastUpdated, ...viewerFields } = parsed;
        return {
            version: 2,
            metadata: {
                session_id: bookId ? `viewer_${bookId}` : null,
                last_updated: lastUpdated || Date.now()
            },
            viewer_session: {
                ...defaults.viewer_session,
                ...viewerFields
            },
            story_state: null
        };
    };

    // Load from LocalStorage on mount
    useEffect(() => {
        if (!bookId) return;

        const key = `storysmith_v1_progress_${bookId}`;
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                const migrated = migrateOldFormat(parsed);
                setState(prev => ({ ...prev, ...migrated }));
            }
        } catch (e) {
            console.warn("Failed to load progress:", e);
        }
        setIsLoaded(true);
    }, [bookId]);

    // Save to LocalStorage on change (debounced)
    const saveTimeout = useRef(null);
    useEffect(() => {
        if (!bookId || !isLoaded) return;

        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(() => {
            const key = `storysmith_v1_progress_${bookId}`;
            const toSave = {
                ...state,
                metadata: { ...state.metadata, last_updated: Date.now() }
            };
            try {
                localStorage.setItem(key, JSON.stringify(toSave));
            } catch (e) {
                console.warn("Failed to save progress:", e);
            }
        }, 500);

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        }
    }, [state, bookId, isLoaded]);

    // Helper to update viewer_session fields
    const updateSession = (updates) => setState(s => ({
        ...s,
        viewer_session: { ...s.viewer_session, ...updates }
    }));

    // Actions (all target viewer_session)
    const setMode = (mode) => updateSession({ mode });
    const setTheme = (theme) => updateSession({ theme });
    const setFollowSystem = (follow) => updateSession({ followSystem: follow });
    const setReducedMotion = (reduced) => updateSession({ reducedMotion: reduced });
    const setFontScale = (scale) => updateSession({ fontScale: scale });
    const setVellumExpanded = (expanded) => updateSession({ vellumExpanded: expanded });
    const setVellumPosition = (pos) => updateSession({ vellumPosition: pos });
    const setCurrentIndex = (index) => updateSession({ currentIndex: index });

    const setFlag = (flag, value = true) => setState(s => ({
        ...s,
        viewer_session: {
            ...s.viewer_session,
            flags: { ...s.viewer_session.flags, [flag]: value }
        }
    }));

    const addBookmark = (pageIndex) => setState(s => ({
        ...s,
        viewer_session: {
            ...s.viewer_session,
            bookmarks: [...new Set([...s.viewer_session.bookmarks, pageIndex])]
        }
    }));

    const removeBookmark = (pageIndex) => setState(s => ({
        ...s,
        viewer_session: {
            ...s.viewer_session,
            bookmarks: s.viewer_session.bookmarks.filter(b => b !== pageIndex)
        }
    }));

    const resetProgress = () => {
        setState(defaults);
        if (bookId) {
            localStorage.removeItem(`storysmith_v1_progress_${bookId}`);
        }
    };

    /**
     * Set the canonical StoryState (without overwriting viewer_session).
     */
    const setStoryState = (storyStateObj) => setState(s => ({
        ...s,
        story_state: storyStateObj
    }));

    // Expose viewer_session fields at top level for backward compatibility with consumers
    const sessionState = state.viewer_session || {};

    return {
        state: sessionState, // Expose flattened session for existing consumers
        fullState: state, // Expose full envelope for debugging/persistence
        isLoaded,
        setMode,
        setTheme,
        setFollowSystem,
        setReducedMotion,
        setFontScale,
        setVellumExpanded,
        setVellumPosition,
        setCurrentIndex,
        setFlag,
        addBookmark,
        removeBookmark,
        resetProgress,
        setStoryState // For persisting canonical StoryState
    };
}

