
import { exportBundle } from '../lib/bundleExporter.js';
import { importBundleFromString } from '../lib/bundleImporter.js';
import { createEmptyStoryState } from '../lib/storyState.js';

// Mock validateBundle if it fails to import due to missing deps
// But here we think it should work.

async function verifyBundles() {
	console.log("=== Verifying Bundle Contracts ===");

	/****************************************
	 * 1. Test Part1 (Act I -> Act II)
	 ****************************************/
	console.log("\n--- Testing Part1 Export/Import ---");
	const statePart1 = createEmptyStoryState();
	statePart1.story_content.CharacterBlock = {
		hero_name: "Test Hero",
		character_details: { name: "Test Hero", age: "10" }
	};

	try {
		const exported1 = exportBundle(statePart1, 'Part1');
		console.log("✓ Part1 Exported");

		const imported1 = importBundleFromString(exported1.jsonString, 'Part1');
		if (imported1.success) console.log("✓ Part1 Imported Successfully");
		else console.error("x Part1 Import Failed:", imported1.errors);

		if (imported1.storyState.story_content.CharacterBlock.hero_name === "Test Hero") {
			console.log("✓ Data Integrity Verified");
		} else {
			console.error("x Data Integrity Failed");
		}
	} catch (e) {
		console.error("x Part1 Failed:", e.message);
	}

	/****************************************
	 * 2. Test Part2 (Act II -> Act III)
	 ****************************************/
	console.log("\n--- Testing Part2 Export/Import ---");
	const statePart2 = JSON.parse(JSON.stringify(statePart1)); // Deep copy
	statePart2.story_content.SceneJSON_array = [
		{ scene_id: 1, scene_title: "Scene 1", illustration_prompt: "A hero stands." }
	];
	statePart2.story_content.Cover = { cover_image_prompt: "A cool cover." };

	try {
		const exported2 = exportBundle(statePart2, 'Part2');
		console.log("✓ Part2 Exported");

		const imported2 = importBundleFromString(exported2.jsonString, 'Part2');
		if (imported2.success) console.log("✓ Part2 Imported Successfully");
		else console.error("x Part2 Import Failed:", imported2.errors);
	} catch (e) {
		console.error("x Part2 Failed:", e.message);
	}

	/****************************************
	 * 3. Test Final (Act III -> Viewer)
	 ****************************************/
	console.log("\n--- Testing Final Export/Import ---");
	const stateFinal = JSON.parse(JSON.stringify(statePart2));
	stateFinal.story_content.SceneJSON_array[0].illustration_url = "http://example.com/img.png";
	stateFinal.story_content.Cover.cover_image_url = "http://example.com/cover.png";
	stateFinal.story_content.AssetsManifest = {
		hero_image: null,
		cover_image: "http://example.com/cover.png",
		scene_images: ["http://example.com/img.png"]
	};

	try {
		const exportedFinal = exportBundle(stateFinal, 'Final');
		console.log("✓ Final Exported");

		const importedFinal = importBundleFromString(exportedFinal.jsonString, 'Final');
		if (importedFinal.success) console.log("✓ Final Imported Successfully");
		else console.error("x Final Import Failed:", importedFinal.errors);
	} catch (e) {
		console.error("x Final Failed:", e.message);
	}
}

verifyBundles();
