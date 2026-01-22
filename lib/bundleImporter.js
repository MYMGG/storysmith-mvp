/**
 * StorySmith Bundle Import Utility
 * Task: TS-005
 * Spec: docs/specs/storysmith-bundle-handoff-plan-v3.0.md
 *
 * Imports and validates StoryState bundles for handoff between Acts.
 */

import { normalizeToStoryState, isValidStoryState } from './storyState.js';
import { validateBundle, ERROR_MESSAGES } from './bundleValidator.js';

// ============================================================================
// Constants
// ============================================================================

const CURRENT_BUNDLE_VERSION = '1.0';
const LEGACY_BUNDLE_VERSION = '0.9';

// ============================================================================
// File Parsing
// ============================================================================

/**
 * Parses a File or Blob as JSON.
 * @param {File | Blob} file - The file to parse.
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function parseJsonFile(file) {
    try {
        const text = await file.text();

        if (!text.trim()) {
            return { data: null, error: ERROR_MESSAGES.NOT_JSON };
        }

        const data = JSON.parse(text);
        return { data, error: null };
    } catch (err) {
        // Check if it's a JSON parse error
        if (err instanceof SyntaxError) {
            return { data: null, error: ERROR_MESSAGES.NOT_JSON };
        }
        return { data: null, error: `Failed to read file: ${err.message}` };
    }
}

/**
 * Parses a JSON string directly.
 * @param {string} jsonString - The JSON string to parse.
 * @returns {{ data: Object | null, error: string | null }}
 */
export function parseJsonString(jsonString) {
    try {
        if (!jsonString || !jsonString.trim()) {
            return { data: null, error: ERROR_MESSAGES.NOT_JSON };
        }

        const data = JSON.parse(jsonString);
        return { data, error: null };
    } catch (err) {
        if (err instanceof SyntaxError) {
            return { data: null, error: ERROR_MESSAGES.NOT_JSON };
        }
        return { data: null, error: `Failed to parse JSON: ${err.message}` };
    }
}

// ============================================================================
// Legacy Migration
// ============================================================================

/**
 * Migrates a legacy bundle format to the current version.
 * Handles:
 * - Missing bundleVersion (assume v0.9)
 * - SessionState alias → StoryState wrapper
 * - Flat schema format
 *
 * @param {Object} bundle - The bundle to migrate.
 * @returns {Object} The migrated bundle.
 */
export function migrateLegacyBundle(bundle) {
    if (!bundle || typeof bundle !== 'object') {
        return bundle;
    }

    let migrated = { ...bundle };
    let migrationActions = [];

    // Check for missing bundleVersion
    if (!migrated.bundleVersion) {
        migrated.bundleVersion = LEGACY_BUNDLE_VERSION;
        migrationActions.push('Added missing bundleVersion (assumed v0.9)');
    }

    // Handle SessionState alias → StoryState
    if (migrated.SessionState && !migrated.StoryState) {
        migrated.StoryState = migrated.SessionState;
        delete migrated.SessionState;
        migrationActions.push('Migrated SessionState alias to StoryState');
    }

    // Handle legacy flat schema (pages array at root)
    if (Array.isArray(migrated.pages) && !migrated.StoryState) {
        // This looks like a flat viewer schema, wrap it
        migrated = {
            bundleType: migrated.bundleType || 'Part1',
            bundleVersion: CURRENT_BUNDLE_VERSION,
            exportedAt: new Date().toISOString(),
            StoryState: normalizeToStoryState(migrated),
        };
        migrationActions.push('Migrated flat schema to canonical bundle envelope');
    }

    // Ensure CharacterBlock has character_details structure (SpinTale requirement)
    if (migrated.StoryState?.story_content?.CharacterBlock) {
        const cb = migrated.StoryState.story_content.CharacterBlock;
        if (cb.hero_name && !cb.character_details) {
            cb.character_details = {
                name: cb.hero_name,
                description: cb.hero_description,
                traits: cb.traits,
                hero_image_prompt: cb.hero_image_prompt,
                hero_image_url: cb.hero_image_url
            };
            migrationActions.push('Normalized CharacterBlock to include character_details');
        }
    }

    // Migrate from v0.9 to v1.0 if needed
    if (migrated.bundleVersion === LEGACY_BUNDLE_VERSION) {
        // Apply any v0.9 → v1.0 migrations here
        // Currently no breaking changes between versions
        migrated.bundleVersion = CURRENT_BUNDLE_VERSION;
        migrationActions.push('Upgraded bundleVersion from v0.9 to v1.0');
    }

    // Log migration actions for debugging
    if (migrationActions.length > 0) {
        console.info('[bundleImporter] Migration applied:', migrationActions.join('; '));
    }

    return migrated;
}

// ============================================================================
// Main Import Function
// ============================================================================

/**
 * Imports a bundle from a File or Blob.
 *
 * @param {File | Blob} file - The file to import.
 * @param {'Part1' | 'Part2' | 'Final'} expectedType - The expected bundle type for validation.
 * @returns {Promise<{ success: boolean, storyState: Object | null, errors: string[] }>}
 */
export async function importBundle(file, expectedType) {
    // Step 1: Parse the file as JSON
    const { data, error: parseError } = await parseJsonFile(file);

    if (parseError) {
        return { success: false, storyState: null, errors: [parseError] };
    }

    // Step 2: Migrate legacy formats
    const migratedBundle = migrateLegacyBundle(data);

    // Step 3: Validate the bundle
    const validation = validateBundle(migratedBundle, expectedType);

    if (!validation.valid) {
        return { success: false, storyState: null, errors: validation.errors };
    }

    // Step 4: Normalize to canonical StoryState
    let storyState;
    try {
        storyState = normalizeToStoryState(migratedBundle.StoryState);
    } catch (err) {
        return {
            success: false,
            storyState: null,
            errors: [`Failed to normalize StoryState: ${err.message}`],
        };
    }

    // Step 5: Final validation of normalized state
    if (!isValidStoryState(storyState)) {
        return {
            success: false,
            storyState: null,
            errors: [ERROR_MESSAGES.INVALID_STORY_STATE],
        };
    }

    return { success: true, storyState, errors: [] };
}

/**
 * Imports a bundle from a JSON string (for testing or programmatic use).
 *
 * @param {string} jsonString - The JSON string to import.
 * @param {'Part1' | 'Part2' | 'Final'} expectedType - The expected bundle type for validation.
 * @returns {{ success: boolean, storyState: Object | null, errors: string[] }}
 */
export function importBundleFromString(jsonString, expectedType) {
    // Step 1: Parse the JSON string
    const { data, error: parseError } = parseJsonString(jsonString);

    if (parseError) {
        return { success: false, storyState: null, errors: [parseError] };
    }

    // Step 2: Migrate legacy formats
    const migratedBundle = migrateLegacyBundle(data);

    // Step 3: Validate the bundle
    const validation = validateBundle(migratedBundle, expectedType);

    if (!validation.valid) {
        return { success: false, storyState: null, errors: validation.errors };
    }

    // Step 4: Normalize to canonical StoryState
    let storyState;
    try {
        storyState = normalizeToStoryState(migratedBundle.StoryState);
    } catch (err) {
        return {
            success: false,
            storyState: null,
            errors: [`Failed to normalize StoryState: ${err.message}`],
        };
    }

    // Step 5: Final validation of normalized state
    if (!isValidStoryState(storyState)) {
        return {
            success: false,
            storyState: null,
            errors: [ERROR_MESSAGES.INVALID_STORY_STATE],
        };
    }

    return { success: true, storyState, errors: [] };
}

// ============================================================================
// Utility Exports
// ============================================================================

export { CURRENT_BUNDLE_VERSION, LEGACY_BUNDLE_VERSION };

export default {
    importBundle,
    importBundleFromString,
    parseJsonFile,
    parseJsonString,
    migrateLegacyBundle,
    CURRENT_BUNDLE_VERSION,
    LEGACY_BUNDLE_VERSION,
};
