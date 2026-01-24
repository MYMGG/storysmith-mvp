import { Station } from "./stationTypes";

/**
 * TS-035 — Minimal Station Config (Overlay)
 * Goal: represent the CURRENT journey without behavior changes.
 * NOTE: Not wired into runtime yet.
 */
export const STATIONS: Station[] = [
	// META entry points
	{
		id: "meta.projects.hub",
		actId: "META",
		type: "interaction",
		title: "Projects Hub",
		description: "Select or manage projects; routes into main app with loaded StoryState.",
		entry: { kind: "route", path: "/projects" },
		toneProfile: "craftsman",
		outputsProduced: ["LoadedProjectStoryState"],
		next: [{ to: "act1.forgehero.flow" }],
	},
	{
		id: "meta.viewer.read",
		actId: "META",
		type: "interaction",
		title: "Viewer Read Mode",
		description: "Read a stored StoryState as a book experience.",
		entry: { kind: "route", path: "/viewer/[bookId]" },
		toneProfile: "craftsman",
		inputsNeeded: ["story_state (from persistence)"],
	},

	// ACT I — activeTab = 0
	{
		id: "act1.forgehero.flow",
		actId: "ACT_I",
		type: "interaction",
		title: "Forge Hero",
		description: "Act I hero creation flow (tab 0).",
		entry: { kind: "tab", index: 0 },
		toneProfile: "showman",
		outputsProduced: ["CharacterBlock", "MyHeroAssetBundle_Part1.json (export)"],
		validations: [
			{
				id: "v.act1.characterblock.present",
				description: "Hero character data exists before leaving Act I.",
				requires: ["CharacterBlock"],
			},
		],
		recovery: { retryable: true, resumable: true, rollbackSafe: true },
		next: [{ to: "act1.achievement.hero-card" }],
	},
	{
		id: "act1.achievement.hero-card",
		actId: "ACT_I",
		type: "achievement",
		title: "Hero Forged",
		description: "Achievement landing: reveal Hero Card + proof-of-work.",
		toneProfile: "ceremonial",
		outputsProduced: ["Artifact:HeroCard", "ProgressPassport:ActI"],
		tags: ["checkpoint", "artifact:hero-card"],
		next: [{ to: "act2.spintale.flow" }],
	},

	// ACT II — activeTab = 1
	{
		id: "act2.spintale.flow",
		actId: "ACT_II",
		type: "interaction",
		title: "Spin Tale",
		description: "Act II story scene creation + prompts-only pipeline (tab 1).",
		entry: { kind: "tab", index: 1 },
		toneProfile: "craftsman",
		inputsNeeded: ["CharacterBlock (imported or carried)"],
		outputsProduced: ["SceneJSON_array (with illustration_prompt)", "MyStoryAssetBundle_Part2.json (export)"],
		validations: [
			{
				id: "v.act2.scenes.complete",
				description: "All scenes approved before exporting Part 2 bundle.",
				requires: ["SceneJSON_array[*].scene_status == pending_illustration"],
			},
		],
		recovery: { retryable: true, resumable: true, rollbackSafe: true },
		next: [{ to: "act2.achievement.blueprint" }],
	},
	{
		id: "act2.achievement.blueprint",
		actId: "ACT_II",
		type: "achievement",
		title: "Story Blueprint Ready",
		description: "Achievement landing: reveal Blueprint + scene map.",
		toneProfile: "ceremonial",
		outputsProduced: ["Artifact:Blueprint", "ProgressPassport:ActII"],
		tags: ["checkpoint", "artifact:blueprint"],
		next: [{ to: "act3.bindbook.flow" }],
	},

	// ACT III — activeTab = 2
	{
		id: "act3.bindbook.flow",
		actId: "ACT_III",
		type: "interaction",
		title: "Bind Book",
		description: "Act III import + image generation + final export (tab 2).",
		entry: { kind: "tab", index: 2 },
		toneProfile: "craftsman",
		inputsNeeded: ["MyStoryAssetBundle_Part2.json (import)"],
		outputsProduced: ["SceneJSON_array[*].illustration_url", "Cover.cover_image_url", "Final bundle export"],
		validations: [
			{
				id: "v.act3.images.ready",
				description: "All scenes illustrated and cover present before final export.",
				requires: ["SceneJSON_array[*].scene_status == illustrated", "Cover.cover_image_url"],
			},
		],
		recovery: { retryable: true, resumable: true, rollbackSafe: true },
		next: [{ to: "act3.achievement.unveiling" }],
	},
	{
		id: "act3.achievement.unveiling",
		actId: "ACT_III",
		type: "achievement",
		title: "Grand Unveiling",
		description: "Completion landing: ceremonial reveal + open viewer + download final bundle.",
		toneProfile: "ceremonial",
		outputsProduced: ["Artifact:Certificate", "Artifact:FinalPack"],
		tags: ["checkpoint", "artifact:final-pack"],
	},
];
