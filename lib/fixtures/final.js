import { makePart2Fixture } from "./part2.js";

/**
 * Minimal Final fixture: Part2 + fake/placeholder URLs to exercise viewer/actIII UI.
 * NOTE: These URLs are placeholders; real generation loop will replace them.
 */
export function makeFinalFixture() {
	const ss = makePart2Fixture();

	// Pretend images are generated (placeholders).
	ss.SceneJSON_array = (ss.SceneJSON_array ?? []).map((s, idx) => ({
		...s,
		scene_status: "illustrated",
		illustration_url: s.illustration_url || `https://example.com/fixture/scene-${idx + 1}.jpg`,
	}));

	ss.Cover = ss.Cover ?? {};
	ss.Cover.cover_image_url = ss.Cover.cover_image_url || "https://example.com/fixture/cover.jpg";

	ss.AssetsManifest = ss.AssetsManifest ?? {};
	ss.AssetsManifest.scene_images = ss.AssetsManifest.scene_images || ss.SceneJSON_array.map((s) => s.illustration_url);
	ss.AssetsManifest.cover_image = ss.AssetsManifest.cover_image || ss.Cover.cover_image_url;

	return ss;
}
