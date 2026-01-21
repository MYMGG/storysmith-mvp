/**
 * StorySmith Bundle Validator
 * Task: TS-005
 * Spec: docs/specs/storysmith-bundle-handoff-plan-v3.0.md
 *
 * Validates bundle schema for import operations between Acts.
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * Supported bundle types.
 */
const VALID_BUNDLE_TYPES = ['Part1', 'Part2', 'Final'];

/**
 * Error messages per spec §2.3
 */
const ERROR_MESSAGES = {
    NOT_JSON: 'Invalid file format. Please upload a .json file.',
    MISSING_BUNDLE_TYPE: "This doesn't appear to be a StorySmith bundle.",
    WRONG_BUNDLE_TYPE: (actual, expected) =>
        `This is a ${actual} bundle. This step requires a ${expected} bundle.`,
    MISSING_CHARACTER_BLOCK: 'This bundle is missing hero data. Please complete Act I first.',
    MISSING_HERO_NAME: 'This bundle is missing the hero name. Please complete Act I first.',
    MISSING_SCENES: 'This bundle has no scenes. Please complete Act II first.',
    MISSING_SCENE_PROMPT: (sceneNum, sceneId) =>
        `Scene ${sceneNum}${sceneId ? ` (${sceneId})` : ''} is missing an illustration prompt.`,
    MISSING_SCENE_URL: (sceneNum, sceneId) =>
        `Scene ${sceneNum}${sceneId ? ` (${sceneId})` : ''} is missing an illustration URL.`,
    MISSING_COVER_PROMPT: 'This bundle is missing a cover image prompt.',
    MISSING_COVER_URL: 'This bundle is missing a cover image URL. Please generate the cover image first.',
    MISSING_ASSETS_MANIFEST: 'This bundle is missing the assets manifest. Please complete all image generation first.',
    MISSING_STORY_STATE: 'This bundle is missing the StoryState data.',
    INVALID_STORY_STATE: 'The StoryState in this bundle is invalid or malformed.',
    MISSING_BUNDLE_VERSION: 'This bundle is missing a version number.',
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates the basic bundle envelope structure.
 * @param {Object} bundle - The bundle object to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateBundleEnvelope(bundle) {
    const errors = [];

    if (!bundle || typeof bundle !== 'object') {
        errors.push(ERROR_MESSAGES.NOT_JSON);
        return { valid: false, errors };
    }

    if (!bundle.bundleType) {
        errors.push(ERROR_MESSAGES.MISSING_BUNDLE_TYPE);
    } else if (!VALID_BUNDLE_TYPES.includes(bundle.bundleType)) {
        errors.push(`Unknown bundle type: "${bundle.bundleType}". Expected one of: ${VALID_BUNDLE_TYPES.join(', ')}.`);
    }

    // bundleVersion is recommended but not strictly required for legacy support
    // We'll warn but not fail if missing

    if (!bundle.StoryState) {
        errors.push(ERROR_MESSAGES.MISSING_STORY_STATE);
    } else if (typeof bundle.StoryState !== 'object') {
        errors.push(ERROR_MESSAGES.INVALID_STORY_STATE);
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Validates a bundle for Part1 import (Act II requires Part1).
 * Required: CharacterBlock with hero_name.
 * @param {Object} storyState - The StoryState from the bundle.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePart1Bundle(storyState) {
    const errors = [];
    const sc = storyState?.story_content;

    if (!sc?.CharacterBlock) {
        errors.push(ERROR_MESSAGES.MISSING_CHARACTER_BLOCK);
    } else if (!sc.CharacterBlock.hero_name) {
        errors.push(ERROR_MESSAGES.MISSING_HERO_NAME);
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Validates a bundle for Part2 import (Act III requires Part2).
 * Required: CharacterBlock, SceneJSON_array with scenes, illustration_prompt per scene, cover_image_prompt.
 * @param {Object} storyState - The StoryState from the bundle.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePart2Bundle(storyState) {
    const errors = [];
    const sc = storyState?.story_content;

    // CharacterBlock required
    if (!sc?.CharacterBlock) {
        errors.push(ERROR_MESSAGES.MISSING_CHARACTER_BLOCK);
    } else if (!sc.CharacterBlock.hero_name) {
        errors.push(ERROR_MESSAGES.MISSING_HERO_NAME);
    }

    // Scenes required
    if (!sc?.SceneJSON_array || sc.SceneJSON_array.length === 0) {
        errors.push(ERROR_MESSAGES.MISSING_SCENES);
    } else {
        // Each scene must have illustration_prompt
        sc.SceneJSON_array.forEach((scene, index) => {
            if (!scene.illustration_prompt) {
                errors.push(ERROR_MESSAGES.MISSING_SCENE_PROMPT(index + 1, scene.scene_id));
            }
        });
    }

    // Cover image prompt required
    if (!sc?.Cover?.cover_image_prompt) {
        errors.push(ERROR_MESSAGES.MISSING_COVER_PROMPT);
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Validates a bundle for Final import (complete story).
 * Required: Everything from Part2 PLUS illustration_url per scene, cover_image_url, AssetsManifest.
 * @param {Object} storyState - The StoryState from the bundle.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateFinalBundle(storyState) {
    const errors = [];
    const sc = storyState?.story_content;

    // CharacterBlock required
    if (!sc?.CharacterBlock) {
        errors.push(ERROR_MESSAGES.MISSING_CHARACTER_BLOCK);
    } else if (!sc.CharacterBlock.hero_name) {
        errors.push(ERROR_MESSAGES.MISSING_HERO_NAME);
    }

    // Scenes required with URLs
    if (!sc?.SceneJSON_array || sc.SceneJSON_array.length === 0) {
        errors.push(ERROR_MESSAGES.MISSING_SCENES);
    } else {
        sc.SceneJSON_array.forEach((scene, index) => {
            if (!scene.illustration_prompt) {
                errors.push(ERROR_MESSAGES.MISSING_SCENE_PROMPT(index + 1, scene.scene_id));
            }
            if (!scene.illustration_url) {
                errors.push(ERROR_MESSAGES.MISSING_SCENE_URL(index + 1, scene.scene_id));
            }
        });
    }

    // Cover required with URL
    if (!sc?.Cover) {
        errors.push(ERROR_MESSAGES.MISSING_COVER_PROMPT);
        errors.push(ERROR_MESSAGES.MISSING_COVER_URL);
    } else {
        if (!sc.Cover.cover_image_prompt) {
            errors.push(ERROR_MESSAGES.MISSING_COVER_PROMPT);
        }
        if (!sc.Cover.cover_image_url) {
            errors.push(ERROR_MESSAGES.MISSING_COVER_URL);
        }
    }

    // AssetsManifest required
    if (!sc?.AssetsManifest) {
        errors.push(ERROR_MESSAGES.MISSING_ASSETS_MANIFEST);
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Bundle type to validator mapping.
 */
const BUNDLE_VALIDATORS = {
    Part1: validatePart1Bundle,
    Part2: validatePart2Bundle,
    Final: validateFinalBundle,
};

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validates a bundle against the expected type.
 *
 * @param {Object} bundle - The bundle object to validate.
 * @param {'Part1' | 'Part2' | 'Final'} expectedType - The expected bundle type.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateBundle(bundle, expectedType) {
    // First, validate the envelope structure
    const envelopeResult = validateBundleEnvelope(bundle);
    if (!envelopeResult.valid) {
        return envelopeResult;
    }

    // Check if bundle type matches expected type
    if (bundle.bundleType !== expectedType) {
        return {
            valid: false,
            errors: [ERROR_MESSAGES.WRONG_BUNDLE_TYPE(bundle.bundleType, expectedType)],
        };
    }

    // Get the appropriate validator for the bundle type
    const validator = BUNDLE_VALIDATORS[expectedType];
    if (!validator) {
        return {
            valid: false,
            errors: [`Unknown expected bundle type: "${expectedType}".`],
        };
    }

    // Validate the StoryState content
    return validator(bundle.StoryState);
}

// ============================================================================
// Utility Exports
// ============================================================================

export { VALID_BUNDLE_TYPES, ERROR_MESSAGES };

export default {
    validateBundle,
    validatePart1Bundle,
    validatePart2Bundle,
    validateFinalBundle,
    VALID_BUNDLE_TYPES,
    ERROR_MESSAGES,
};
