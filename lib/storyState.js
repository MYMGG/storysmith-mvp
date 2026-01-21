/**
 * StorySmith Canonical StoryState Schema Module
 * Based on: docs/specs/storysmith-composite-baseline-v3.0-redacted.md
 *
 * This module provides utilities for working with the canonical StoryState
 * data structure and adapters to/from the flat viewer schema.
 */

// ============================================================================
// JSDoc Type Definitions (for editor intellisense)
// ============================================================================

/**
 * @typedef {Object} CharacterBlock
 * @property {string} [hero_name] - The hero's name.
 * @property {string} [hero_description] - A description of the hero.
 * @property {string} [hero_image_url] - URL to the hero portrait.
 * @property {string} [hero_image_prompt] - The prompt used to generate the hero image.
 * @property {Object} [traits] - Key-value pairs of hero traits.
 */

/**
 * @typedef {Object} SceneJSON
 * @property {string} scene_id - Unique identifier for the scene.
 * @property {string} scene_title - Display title for the scene.
 * @property {'pending_illustration'|'illustrated'|'approved'|'draft'} scene_status - Current status of the scene.
 * @property {Object} [scene_text_components] - Text breakdown.
 * @property {string} [scene_text_components.beginning] - Beginning text.
 * @property {string} [scene_text_components.middle] - Middle text.
 * @property {string} [scene_text_components.end] - End text.
 * @property {string} [scene_full_text] - The complete scene text.
 * @property {string} [illustration_prompt] - Prompt for generating the scene illustration.
 * @property {string} [illustration_url] - URL to the generated illustration.
 * @property {string} [continuity_notes] - Notes for maintaining story continuity.
 * @property {Array<Object>} [hotspots] - Interactive hotspots on the page.
 */

/**
 * @typedef {Object} Cover
 * @property {string} [cover_image_url] - URL to the cover image.
 * @property {string} [cover_image_prompt] - Prompt used for cover generation.
 * @property {string} [cover_title] - Title displayed on the cover.
 */

/**
 * @typedef {Object} AssetsManifest
 * @property {string} [hero_image] - Path/URL to hero image.
 * @property {Array<string>} [scene_images] - Array of scene image URLs.
 * @property {string} [cover_image] - Path/URL to cover image.
 */

/**
 * @typedef {Object} StoryContent
 * @property {CharacterBlock} [CharacterBlock] - Hero/character data.
 * @property {Object} [StoryBlueprintBlock] - Story blueprint (story arc, themes).
 * @property {SceneJSON[]} SceneJSON_array - Array of scene objects.
 * @property {Cover} [Cover] - Cover data.
 * @property {AssetsManifest} [AssetsManifest] - Asset manifest.
 */

/**
 * @typedef {Object} StoryStateMetadata
 * @property {string} session_id - Unique session/story identifier.
 * @property {number} last_updated - Unix timestamp of last update.
 * @property {string} [last_prompt] - The last user prompt.
 */

/**
 * @typedef {Object} StoryData
 * @property {string} story_title - Title of the story.
 * @property {string} [thematic_tone] - Overall thematic tone.
 * @property {string} [visual_style] - Visual style descriptor.
 * @property {string} [visual_consistency_tag] - Tag for visual consistency.
 */

/**
 * @typedef {Object} StoryState
 * @property {number} version - Schema version number.
 * @property {StoryStateMetadata} metadata - Session metadata.
 * @property {StoryData} story_data - Story-level data.
 * @property {StoryContent} story_content - The actual story content.
 */

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates a new, empty StoryState object with sensible defaults.
 * @param {Object} [overrides] - Optional overrides for default values.
 * @returns {StoryState}
 */
export function createEmptyStoryState(overrides = {}) {
    const now = Date.now();
    const sessionId = `ss_${now}_${Math.random().toString(36).substring(2, 9)}`;

    return {
        version: 1,
        metadata: {
            session_id: sessionId,
            last_updated: now,
            last_prompt: null,
            ...overrides.metadata
        },
        story_data: {
            story_title: 'Untitled Story',
            thematic_tone: null,
            visual_style: null,
            visual_consistency_tag: null,
            ...overrides.story_data
        },
        story_content: {
            CharacterBlock: null,
            StoryBlueprintBlock: null,
            SceneJSON_array: [],
            Cover: null,
            AssetsManifest: null,
            ...overrides.story_content
        }
    };
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Checks if the given object is a valid StoryState envelope.
 * Performs minimal runtime checks without additional dependencies.
 * @param {any} obj - The object to validate.
 * @returns {boolean} True if the object appears to be a valid StoryState.
 */
export function isValidStoryState(obj) {
    if (!obj || typeof obj !== 'object') return false;

    // Check for the canonical StoryState envelope keys
    if (
        typeof obj.version === 'number' &&
        obj.metadata && typeof obj.metadata === 'object' &&
        obj.story_data && typeof obj.story_data === 'object' &&
        obj.story_content && typeof obj.story_content === 'object'
    ) {
        // Verify story_content has expected structure
        const sc = obj.story_content;
        return Array.isArray(sc.SceneJSON_array);
    }

    return false;
}

/**
 * Checks if the given object is a flat viewer schema (old format).
 * @param {any} obj - The object to check.
 * @returns {boolean}
 */
function isFlatViewerSchema(obj) {
    if (!obj || typeof obj !== 'object') return false;
    return Array.isArray(obj.pages) && typeof obj.title === 'string';
}

// ============================================================================
// Normalization / Conversion Functions
// ============================================================================

/**
 * Normalizes input to a canonical StoryState.
 * Accepts either:
 * - A valid StoryState (returned as-is)
 * - A flat viewer schema (converted to StoryState)
 * @param {Object} input - The input object.
 * @returns {StoryState}
 */
export function normalizeToStoryState(input) {
    if (!input || typeof input !== 'object') {
        return createEmptyStoryState();
    }

    // Already a valid StoryState
    if (isValidStoryState(input)) {
        return input;
    }

    // Convert from flat viewer schema
    if (isFlatViewerSchema(input)) {
        return convertFlatViewerToStoryState(input);
    }

    // Unknown format - wrap in empty StoryState
    console.warn('[storyState] Unknown input format, returning empty StoryState');
    return createEmptyStoryState();
}

/**
 * Converts a flat viewer schema to canonical StoryState.
 * @param {Object} flat - The flat viewer schema.
 * @returns {StoryState}
 */
function convertFlatViewerToStoryState(flat) {
    const now = Date.now();
    const sessionId = flat.id || `ss_${now}_${Math.random().toString(36).substring(2, 9)}`;

    // Extract cover page if present
    const coverPage = flat.pages?.find(p => p.type === 'cover');
    const contentPages = flat.pages?.filter(p => p.type !== 'cover') || [];

    // Convert pages to SceneJSON_array
    const scenes = contentPages.map((page, index) => ({
        scene_id: page.id || `scene_${index + 1}`,
        scene_title: page.title || `Scene ${index + 1}`,
        scene_status: page.imageUrl ? 'illustrated' : 'pending_illustration',
        scene_text_components: null,
        scene_full_text: page.text || '',
        illustration_prompt: null,
        illustration_url: page.imageUrl || null,
        continuity_notes: null,
        hotspots: page.hotspots || []
    }));

    return {
        version: 1,
        metadata: {
            session_id: sessionId,
            last_updated: now,
            last_prompt: null
        },
        story_data: {
            story_title: flat.title || 'Untitled Story',
            thematic_tone: null,
            visual_style: null,
            visual_consistency_tag: null
        },
        story_content: {
            CharacterBlock: null,
            StoryBlueprintBlock: null,
            SceneJSON_array: scenes,
            Cover: coverPage ? {
                cover_image_url: coverPage.imageUrl || null,
                cover_image_prompt: null,
                cover_title: coverPage.text || flat.title || null
            } : null,
            AssetsManifest: null
        },
        // Preserve original flat data for viewer compatibility
        _viewerMeta: {
            author: flat.author || null,
            tableOfContents: flat.tableOfContents || []
        }
    };
}

// ============================================================================
// Adapter Functions (StoryState -> Viewer Schema)
// ============================================================================

/**
 * Converts a StoryState to the flat viewer schema expected by components/viewer/*.
 * @param {StoryState} storyState - The canonical StoryState.
 * @returns {Object} The flat viewer schema.
 */
export function toViewerBook(storyState) {
    if (!storyState || !isValidStoryState(storyState)) {
        console.warn('[storyState] Invalid StoryState passed to toViewerBook');
        return { id: 'unknown', title: 'Error', author: '', pages: [], tableOfContents: [] };
    }

    const { metadata, story_data, story_content, _viewerMeta } = storyState;

    // Build pages array
    const pages = [];

    // Add cover page if present
    if (story_content.Cover) {
        pages.push({
            id: 'cover',
            type: 'cover',
            imageUrl: story_content.Cover.cover_image_url || '/books/sample/cover.svg',
            text: story_content.Cover.cover_title || story_data.story_title,
            textPosition: 'center',
            hotspots: []
        });
    }

    // Add scene pages
    (story_content.SceneJSON_array || []).forEach((scene) => {
        pages.push({
            id: scene.scene_id,
            type: 'spread',
            imageUrl: scene.illustration_url || '/books/sample/page-1.svg',
            text: scene.scene_full_text || '',
            hotspots: scene.hotspots || []
        });
    });

    // Build table of contents
    const tableOfContents = _viewerMeta?.tableOfContents || pages.map((p, i) => ({
        id: p.id,
        title: p.type === 'cover' ? 'Cover' : `Chapter ${i}`
    }));

    return {
        id: metadata.session_id,
        title: story_data.story_title,
        author: _viewerMeta?.author || 'StorySmith',
        pages,
        tableOfContents
    };
}

// ============================================================================
// Export all utilities
// ============================================================================
export default {
    createEmptyStoryState,
    isValidStoryState,
    normalizeToStoryState,
    toViewerBook
};
