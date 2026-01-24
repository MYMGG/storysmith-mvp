import { stationNavigator, ResolveStationInput } from "./navigator";

/**
 * Dev-only helper: logs current station id + basic metadata.
 * Hard-gated behind STORYSMITH_DEVTOOLS=1.
 */
export function logCurrentStationIfDev(input: ResolveStationInput): void {
	if (process.env.STORYSMITH_DEVTOOLS !== "1") return;

	const id = stationNavigator.resolveCurrentStationId(input);
	if (!id) {
		// eslint-disable-next-line no-console
		console.log("[stations] current=unknown", input);
		return;
	}

	const s = stationNavigator.getStation(id);
	// eslint-disable-next-line no-console
	console.log("[stations] current=", {
		id,
		title: s?.title,
		actId: s?.actId,
		type: s?.type,
	});
}
