/**
 * Sanity Test: Bundle Export Utility (TS-004)
 *
 * This script verifies:
 * 1. exportBundle() produces valid JSON with correct envelope structure
 * 2. Filename matches spec for each bundle type
 * 3. Required top-level keys exist (bundleType, bundleVersion, exportedAt, StoryState)
 *
 * Run: node scripts/sanity-bundle-export.mjs
 */

import { exportBundle } from '../lib/bundleExporter.js';
import { createEmptyStoryState } from '../lib/storyState.js';

console.log('=== TS-004 Bundle Export Sanity Test ===\n');

// Create a minimal valid StoryState for Part1 (requires CharacterBlock with hero_name)
const minimalPart1State = createEmptyStoryState({
    story_data: {
        story_title: 'Test Hero Story',
    },
    story_content: {
        CharacterBlock: {
            hero_name: 'Test Hero',
            hero_description: 'A brave test character.',
            hero_image_url: null,
            hero_image_prompt: 'A heroic figure standing tall.',
            traits: { brave: true, curious: true },
        },
        StoryBlueprintBlock: null,
        SceneJSON_array: [],
        Cover: null,
        AssetsManifest: null,
    },
});

console.log('1. Testing Part1 Export...');
try {
    const result = exportBundle(minimalPart1State, 'Part1');

    console.log(`   ✓ Filename: ${result.filename}`);
    console.log(`   ✓ MIME: ${result.mime}`);
    console.log(`   ✓ JSON length: ${result.jsonString.length} chars`);

    // Verify top-level keys
    const parsed = JSON.parse(result.jsonString);
    const requiredKeys = ['bundleType', 'bundleVersion', 'exportedAt', 'StoryState'];
    const missingKeys = requiredKeys.filter((k) => !(k in parsed));

    if (missingKeys.length > 0) {
        console.log(`   ✗ Missing keys: ${missingKeys.join(', ')}`);
        process.exit(1);
    } else {
        console.log(`   ✓ All required top-level keys present: ${requiredKeys.join(', ')}`);
    }

    // Verify filename matches spec
    if (result.filename !== 'MyHeroAssetBundle_Part1.json') {
        console.log(`   ✗ Filename mismatch: expected MyHeroAssetBundle_Part1.json`);
        process.exit(1);
    }
    console.log(`   ✓ Filename matches spec\n`);

    // Show envelope structure (excluding full StoryState for brevity)
    console.log('   Envelope preview:');
    console.log(`     bundleType: ${parsed.bundleType}`);
    console.log(`     bundleVersion: ${parsed.bundleVersion}`);
    console.log(`     exportedAt: ${parsed.exportedAt}`);
    console.log(`     StoryState.version: ${parsed.StoryState.version}`);
    console.log(
        `     StoryState.story_content.CharacterBlock.hero_name: ${parsed.StoryState.story_content.CharacterBlock.hero_name}`
    );
    console.log('');
} catch (err) {
    console.log(`   ✗ Part1 export failed: ${err.message}`);
    process.exit(1);
}

// Test invalid bundleType
console.log('2. Testing invalid bundleType handling...');
try {
    exportBundle(minimalPart1State, 'InvalidType');
    console.log('   ✗ Should have thrown for invalid bundleType');
    process.exit(1);
} catch (err) {
    if (err.message.includes('Invalid bundleType')) {
        console.log('   ✓ Correctly throws for invalid bundleType\n');
    } else {
        console.log(`   ✗ Unexpected error: ${err.message}`);
        process.exit(1);
    }
}

// Test Part2 validation (should fail without scenes/cover)
console.log('3. Testing Part2 validation (expected to fail without scenes/cover)...');
try {
    exportBundle(minimalPart1State, 'Part2');
    console.log('   ✗ Should have thrown for missing scenes/cover');
    process.exit(1);
} catch (err) {
    if (err.message.includes('Validation failed for Part2')) {
        console.log('   ✓ Correctly rejects Part1-only state for Part2 export');
        console.log(`   Error preview: ${err.message.split('\n')[0]}\n`);
    } else {
        console.log(`   ✗ Unexpected error: ${err.message}`);
        process.exit(1);
    }
}

console.log('=== ALL SANITY TESTS PASSED ===\n');
