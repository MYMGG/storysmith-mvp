import { createEmptyStoryState } from "../storyState.js";
import { makePart1Fixture } from "./part1.js";

/**
 * Minimal Part2 fixture: hero + scenes with prompts-only pipeline.
 */
export function makePart2Fixture() {
	const ss = makePart1Fixture();

	ss.SceneJSON_array = ss.SceneJSON_array ?? [];
	if (ss.SceneJSON_array.length === 0) {
		ss.SceneJSON_array = [
			{
				scene_index: 1,
				title: "The Whispering Gate",
				beat: "Astra finds a gate that only opens for a vow spoken aloud.",
				illustration_prompt: "A twilight stone archway in a quiet forest, soft lantern glow, adventurous but cozy mood.",
				scene_status: "pending_illustration",
				illustration_url: "",
			},
			{
				scene_index: 2,
				title: "The Borrowed Map",
				beat: "A rival offers help… for a price that feels too kind.",
				illustration_prompt: "A small tavern table with an old map unfurled, warm candlelight, subtle tension, fantasy-lite.",
				scene_status: "pending_illustration",
				illustration_url: "",
			},
			{
				scene_index: 3,
				title: "Promise in the Rain",
				beat: "A choice: save face or save someone—Astra chooses the harder good.",
				illustration_prompt: "Rainy street at night, hero offering a cloak to someone in need, reflective puddles, hopeful tone.",
				scene_status: "pending_illustration",
				illustration_url: "",
			},
		];
	}

	ss.Cover = ss.Cover ?? {};
	ss.Cover.cover_image_prompt =
		ss.Cover.cover_image_prompt ??
		"A premium illustrated book cover: Astra Vale before a whispering forest gate, twilight palette, elegant typography space.";

	return ss;
}
