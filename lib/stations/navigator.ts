import { STATIONS } from "./stationConfig";
import { ActId, Station } from "./stationTypes";

export interface StationGraphIssue {
	level: "error" | "warn";
	message: string;
	stationId?: string;
}

export interface ResolveStationInput {
	/** Current route path (e.g. "/", "/projects", "/viewer/abc123") */
	routePath?: string;
	/** Current tab index in main app (activeTab) */
	activeTab?: 0 | 1 | 2;
}

export class StationNavigator {
	private byId: Map<string, Station>;
	private stations: Station[];

	constructor(stations: Station[] = STATIONS) {
		this.stations = stations;
		this.byId = new Map(stations.map((s) => [s.id, s]));
	}

	getAllStations(): Station[] {
		return [...this.stations];
	}

	getStation(id: string): Station | undefined {
		return this.byId.get(id);
	}

	getStationsForAct(actId: ActId): Station[] {
		return this.stations.filter((s) => s.actId === actId);
	}

	getNextStations(id: string): Station[] {
		const s = this.getStation(id);
		if (!s?.next?.length) return [];
		return s.next
			.map((n) => this.getStation(n.to))
			.filter((x): x is Station => Boolean(x));
	}

	/**
	 * Resolve "current station" from the runtime shell (route + activeTab).
	 * v1 is intentionally simple and mirrors the current app structure:
	 * - /projects => meta.projects.hub
	 * - /viewer/* => meta.viewer.read
	 * - otherwise, activeTab maps to Act flow stations
	 *
	 * NOTE: Read-only helper; does not mutate state.
	 */
	resolveCurrentStation(input: ResolveStationInput): Station | undefined {
		const id = this.resolveCurrentStationId(input);
		return id ? this.getStation(id) : undefined;
	}

	resolveCurrentStationId(input: ResolveStationInput): string | undefined {
		const route = (input.routePath ?? "").trim();

		// Route-based meta stations first
		if (route === "/projects") return "meta.projects.hub";
		if (route.startsWith("/viewer/") || route === "/viewer") return "meta.viewer.read";

		// Fall back to tab-based act stations
		switch (input.activeTab) {
			case 0:
				return "act1.forgehero.flow";
			case 1:
				return "act2.spintale.flow";
			case 2:
				return "act3.bindbook.flow";
			default:
				return undefined;
		}
	}

	/**
	 * Minimal sanity checks:
	 * - duplicate ids
	 * - next edges must point to real station ids
	 * - optional: warn on unreachable stations from obvious entry points
	 */
	validateGraph(): StationGraphIssue[] {
		const issues: StationGraphIssue[] = [];

		// Duplicate IDs
		const seen = new Set<string>();
		for (const s of this.stations) {
			if (seen.has(s.id)) {
				issues.push({ level: "error", message: `Duplicate station id: ${s.id}`, stationId: s.id });
			}
			seen.add(s.id);
		}

		// Next edges exist
		for (const s of this.stations) {
			for (const n of s.next ?? []) {
				if (!this.byId.has(n.to)) {
					issues.push({
						level: "error",
						message: `Station "${s.id}" next -> missing target "${n.to}"`,
						stationId: s.id,
					});
				}
			}
		}

		// Unreachable (heuristic): from meta.projects.hub and act1.forgehero.flow
		const roots = ["meta.projects.hub", "act1.forgehero.flow"];
		const reachable = new Set<string>();
		const stack = [...roots].filter((r) => this.byId.has(r));
		while (stack.length) {
			const cur = stack.pop()!;
			if (reachable.has(cur)) continue;
			reachable.add(cur);
			const next = this.getNextStations(cur).map((x) => x.id);
			stack.push(...next);
		}
		for (const s of this.stations) {
			if (!reachable.has(s.id) && !s.id.startsWith("meta.viewer.")) {
				issues.push({
					level: "warn",
					message: `Station appears unreachable from roots: ${s.id}`,
					stationId: s.id,
				});
			}
		}

		return issues;
	}
}

// Convenience singleton
export const stationNavigator = new StationNavigator();
