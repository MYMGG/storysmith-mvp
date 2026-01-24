import { stationNavigator } from "../lib/stations/navigator.ts";

const issues = stationNavigator.validateGraph();

if (!issues.length) {
	console.log("✅ Station graph OK (no issues)");
	process.exit(0);
}

for (const i of issues) {
	const tag = i.level === "error" ? "❌" : "⚠️";
	console.log(`${tag} [${i.level}] ${i.message}`);
}

const hasError = issues.some((x) => x.level === "error");
process.exit(hasError ? 1 : 0);
