/**
 * StorySmith Bundle Export Utility
 * Task: TS-004
 * Spec: docs/specs/storysmith-bundle-handoff-plan-v3.0.md
 *
 * Exports StoryState bundles in the canonical envelope format for handoff between Acts.
 */

import { isValidStoryState, normalizeToStoryState } from './storyState.js';

// ============================================================================
// Constants
// ============================================================================

/**
 * Supported bundle types with their corresponding filenames.
 */
const BUNDLE_CONFIG = {
    Part1: {
        filename: 'MyHeroAssetBundle_Part1.json',
        validateFn: validatePart1,
    },
    Part2: {
        filename: 'MyStoryAssetBundle_Part2.json',
        validateFn: validatePart2,
    },
    Final: {
        filename: 'MyStoryAssetBundle_Final.json',
        validateFn: validateFinal,
    },
};

const BUNDLE_VERSION = '1.0';
const MIME_TYPE = 'application/json';

// ============================================================================
// Validation Functions (per bundle type)
// ============================================================================

/**
 * Validates a StoryState for Part1 export (Act I → Act II).
 * Required: CharacterBlock with hero_name.
 * @param {Object} storyState - The normalized StoryState.
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePart1(storyState) {
    const errors = [];
    const sc = storyState.story_content;

    if (!sc.CharacterBlock) {
        errors.push('Missing CharacterBlock: Hero data is required for Part1 export.');
    } else if (!sc.CharacterBlock.hero_name) {
        errors.push('Missing hero_name in CharacterBlock: Hero must have a name.');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Validates a StoryState for Part2 export (Act II → Act III).
 * Required: CharacterBlock, SceneJSON_array with scenes, illustration_prompt per scene, cover_image_prompt.
 * @param {Object} storyState - The normalized StoryState.
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePart2(storyState) {
    const errors = [];
    const sc = storyState.story_content;

    // CharacterBlock required
    if (!sc.CharacterBlock) {
        errors.push('Missing CharacterBlock: Hero data is required for Part2 export.');
    } else if (!sc.CharacterBlock.hero_name) {
        errors.push('Missing hero_name in CharacterBlock: Hero must have a name.');
    }

    // Scenes required
    if (!sc.SceneJSON_array || sc.SceneJSON_array.length === 0) {
        errors.push('Missing scenes: Part2 export requires at least one scene in SceneJSON_array.');
    } else {
        // Each scene must have illustration_prompt
        sc.SceneJSON_array.forEach((scene, index) => {
            if (!scene.illustration_prompt) {
                errors.push(`Scene ${index + 1} (${scene.scene_id || 'unknown'}) is missing an illustration_prompt.`);
            }
        });
    }

    // Cover image prompt required
    if (!sc.Cover || !sc.Cover.cover_image_prompt) {
        errors.push('Missing cover_image_prompt: Cover must have an illustration prompt for Part2 export.');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Validates a StoryState for Final export (complete story).
 * Required: Everything from Part2 PLUS illustration_url per scene, cover_image_url, AssetsManifest.
 * @param {Object} storyState - The normalized StoryState.
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateFinal(storyState) {
    const errors = [];
    const sc = storyState.story_content;

    // CharacterBlock required
    if (!sc.CharacterBlock) {
        errors.push('Missing CharacterBlock: Hero data is required for Final export.');
    } else if (!sc.CharacterBlock.hero_name) {
        errors.push('Missing hero_name in CharacterBlock: Hero must have a name.');
    }

    // Scenes required with URLs
    if (!sc.SceneJSON_array || sc.SceneJSON_array.length === 0) {
        errors.push('Missing scenes: Final export requires at least one scene in SceneJSON_array.');
    } else {
        sc.SceneJSON_array.forEach((scene, index) => {
            if (!scene.illustration_prompt) {
                errors.push(`Scene ${index + 1} (${scene.scene_id || 'unknown'}) is missing an illustration_prompt.`);
            }
            if (!scene.illustration_url) {
                errors.push(`Scene ${index + 1} (${scene.scene_id || 'unknown'}) is missing an illustration_url.`);
            }
        });
    }

    // Cover required with URL
    if (!sc.Cover) {
        errors.push('Missing Cover: Final export requires cover data.');
    } else {
        if (!sc.Cover.cover_image_prompt) {
            errors.push('Missing cover_image_prompt in Cover.');
        }
        if (!sc.Cover.cover_image_url) {
            errors.push('Missing cover_image_url: Cover image must be generated for Final export.');
        }
    }

    // AssetsManifest required
    if (!sc.AssetsManifest) {
        errors.push('Missing AssetsManifest: Final export requires a complete assets manifest.');
    }

    return { valid: errors.length === 0, errors };
}

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Exports a StoryState as a downloadable bundle.
 *
 * @param {Object} storyState - The StoryState object (may be legacy format).
 * @param {'Part1' | 'Part2' | 'Final'} bundleType - The type of bundle to export.
 * @returns {{ filename: string, mime: string, jsonString: string, object: Object }}
 * @throws {Error} If bundleType is invalid or storyState fails validation.
 */
export function exportBundle(storyState, bundleType) {
    // Validate bundleType
    if (!BUNDLE_CONFIG[bundleType]) {
        throw new Error(
            `Invalid bundleType: "${bundleType}". Must be one of: ${Object.keys(BUNDLE_CONFIG).join(', ')}`
        );
    }

    const config = BUNDLE_CONFIG[bundleType];

    // Normalize storyState (handles legacy formats)
    let normalized;
    try {
        normalized = normalizeToStoryState(storyState);
    } catch (err) {
        throw new Error(`Failed to normalize storyState: ${err.message}`);
    }

    // Check if normalization produced a valid StoryState
    if (!isValidStoryState(normalized)) {
        throw new Error(
            'Invalid storyState after normalization: The provided data could not be converted to a valid StoryState. ' +
            'Ensure the object has the required structure (version, metadata, story_data, story_content).'
        );
    }

    // Validate for the specific bundle type
    const validation = config.validateFn(normalized);
    if (!validation.valid) {
        throw new Error(
            `Validation failed for ${bundleType} export:\n- ${validation.errors.join('\n- ')}`
        );
    }

    // Build the canonical bundle envelope
    const bundleEnvelope = {
        bundleType,
        bundleVersion: BUNDLE_VERSION,
        exportedAt: new Date().toISOString(),
        StoryState: normalized,
    };

    // Serialize to JSON
    const jsonString = JSON.stringify(bundleEnvelope, null, 2);

    return {
        filename: config.filename,
        mime: MIME_TYPE,
        jsonString,
        object: bundleEnvelope,
    };
}

// ============================================================================
// Utility Exports (for testing / advanced usage)
// ============================================================================

export { validatePart1, validatePart2, validateFinal, BUNDLE_CONFIG, BUNDLE_VERSION };

export default {
    exportBundle,
    validatePart1,
    validatePart2,
    validateFinal,
    BUNDLE_CONFIG,
    BUNDLE_VERSION,
};
