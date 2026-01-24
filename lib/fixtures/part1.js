import { createEmptyStoryState } from "../storyState.js";

/**
 * Minimal Part1 fixture: hero-only.
 * Keep schema-light; relies on createEmptyStoryState defaults.
 */
export function makePart1Fixture() {
	const ss = createEmptyStoryState({ title: "Fixture: Part 1 (Hero)" });

	// Best-effort: populate common/expected fields without inventing new schema.
	ss.CharacterBlock = ss.CharacterBlock ?? {};
	ss.CharacterBlock.hero_name = ss.CharacterBlock.hero_name ?? "Astra Vale";
	ss.CharacterBlock.tagline = ss.CharacterBlock.tagline ?? "A brave heart with a clever grin.";
	ss.CharacterBlock.traits = ss.CharacterBlock.traits ?? ["curious", "steadfast", "quick-witted"];
	ss.CharacterBlock.flaw = ss.CharacterBlock.flaw ?? "overcommits to helping";
	ss.CharacterBlock.goal = ss.CharacterBlock.goal ?? "protect a small town’s secret";

	return ss;
}
