import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { STATIONS } from "../../lib/stations/stationConfig";
import { FIXTURE_BUILDERS } from "../../lib/fixtures/index.js";

function isDevtoolsEnabled() {
	return (
		process.env.NODE_ENV !== "production" &&
		process.env.STORYSMITH_DEVTOOLS === "1"
	);
}

export default function SimulatorPage() {
	const router = useRouter();
	const [selectedStationId, setSelectedStationId] = useState("act1.forgehero.flow");
	const [viewerBookId, setViewerBookId] = useState("");
	const [fixtureType, setFixtureType] = useState("Part1");
	const [runStatus, setRunStatus] = useState("idle"); // idle | running | success | error
	const [runLog, setRunLog] = useState(null);
	const [sceneCount, setSceneCount] = useState(6);

	// New state from TS-025
	const [sweepN, setSweepN] = useState(10);
	const [baseSeed, setBaseSeed] = useState(() => String(Date.now()));
	const [sameyThreshold, setSameyThreshold] = useState(0.62);
	const [sweepStatus, setSweepStatus] = useState("idle"); // idle | running | done | error
	const [sweepResults, setSweepResults] = useState(null);

	if (!isDevtoolsEnabled()) {
		// Quiet 404-style response.
		return (
			<div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
				<h1 style={{ fontSize: 18, margin: 0 }}>Not Found</h1>
			</div>
		);
	}

	const stations = useMemo(() => STATIONS, []);
	const selected = stations.find((s) => s.id === selectedStationId);

	// --- Tiny deterministic RNG (no deps) ---
	function mulberry32(seed) {
		let t = seed >>> 0;
		return function () {
			t += 0x6D2B79F5;
			let r = Math.imul(t ^ (t >>> 15), 1 | t);
			r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
			return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
		};
	}

	function pick(rng, arr) {
		return arr[Math.floor(rng() * arr.length)];
	}

	function tokenize(s) {
		return String(s || "")
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, " ")
			.split(/\s+/)
			.filter(Boolean);
	}

	function jaccard(a, b) {
		const A = new Set(tokenize(a));
		const B = new Set(tokenize(b));
		if (A.size === 0 && B.size === 0) return 0;
		let inter = 0;
		for (const x of A) if (B.has(x)) inter++;
		const union = A.size + B.size - inter;
		return union ? inter / union : 0;
	}

	function downloadJson(filename, obj) {
		const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	function loadFixture() {
		const builder = FIXTURE_BUILDERS[fixtureType];
		if (!builder) return;
		const storyState = builder();

		// Default act for each fixture
		const defaultTab = fixtureType === "Part1" ? 0 : fixtureType === "Part2" ? 1 : 2;

		try {
			localStorage.setItem(
				"storysmith_dev_fixture_payload",
				JSON.stringify({ fixtureType, storyState, activeTab: defaultTab })
			);
			// Also set jump tab so we land in correct place
			localStorage.setItem("storysmith_dev_jump_activeTab", String(defaultTab));
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn("Failed to store fixture payload", e);
		}

		router.push("/");
	}

	async function runGoldenPathCore({ seed, label }) {
		const startedAt = Date.now();
		const stepTimings = {};
		const rng = mulberry32(seed >>> 0);

		function mark(name, t0) {
			stepTimings[name] = Date.now() - t0;
		}

		// Start from selected fixture as baseline
		const builder = FIXTURE_BUILDERS[fixtureType];
		if (!builder) throw new Error(`Unknown fixtureType: ${fixtureType}`);
		let storyState = builder();

		// Ensure story_content container exists (SpinTale pattern)
		storyState = {
			...storyState,
			story_content: { ...(storyState.story_content || {}) },
		};

		// --- Step A: Generate Blueprint (structured endpoint) ---
		{
			const t0 = Date.now();
			const heroName =
				storyState?.CharacterBlock?.hero_name ||
				storyState?.CharacterBlock?.name ||
				"Your Hero";

			const heroDetails = {
				heroName,
				character: storyState.CharacterBlock || {},
			};

			const resp = await fetch("/api/generateBlueprint", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ heroDetails }),
			});
			if (!resp.ok) throw new Error(`generateBlueprint failed: ${resp.status}`);
			const data = await resp.json();

			const blueprint = data?.story_content?.StoryBlueprintBlock;
			if (!blueprint) throw new Error("generateBlueprint: missing story_content.StoryBlueprintBlock");

			const moods = ["cinematic", "cozy", "mysterious", "epic", "warm", "witty"];
			const settings = ["forest gate", "harbor town", "mountain pass", "hidden library", "moonlit market", "ancient ruins"];
			const motif = ["belonging", "courage", "curiosity", "kindness", "truth", "second chances"];

			const coverPrompt =
				`A premium illustrated book cover featuring ${heroName} in a ${pick(rng, settings)}, ` +
				`${pick(rng, moods)} lighting, motif of ${pick(rng, motif)}, elegant typography space.`;

			// Merge per SpinTale pattern (story_content) AND mirror into root for compatibility
			storyState = {
				...storyState,
				StoryBlueprintBlock: blueprint,
				story_content: {
					...(storyState.story_content || {}),
					StoryBlueprintBlock: blueprint,
					Cover: {
						cover_image_prompt: coverPrompt,
						cover_image_url: null,
					},
				},
				Cover: {
					...(storyState.Cover || {}),
					cover_image_prompt: coverPrompt,
					cover_image_url: null,
				},
			};

			mark("blueprint_ms", t0);
		}

		// --- Step B: Construct Scenes (prompts-only, pending_illustration) ---
		{
			const t0 = Date.now();
			const heroName =
				storyState?.CharacterBlock?.hero_name ||
				storyState?.CharacterBlock?.name ||
				"Your Hero";

			const twists = ["a hidden vow", "a surprise ally", "a gentle sacrifice", "a clever reversal", "a secret map", "a misunderstood rival"];
			const scenePlaces = ["lantern alley", "quiet tavern", "stormy cliff", "sunlit greenhouse", "whispering archway", "clockwork bridge"];
			const tones = ["warm", "dry-witty", "adventurous", "calm", "dreamlike", "sharp"];

			const scenes = [];
			const n = Math.max(1, Math.min(24, Number(sceneCount) || 6));
			for (let i = 1; i <= n; i++) {
				const sceneTitle = `${pick(rng, ["The", "A", "Beyond", "Under", "Through"])} ${pick(rng, scenePlaces)}`;
				const beat = `Beat ${i}: ${heroName} faces ${pick(rng, twists)} at the ${pick(rng, scenePlaces)}.`;
				const prompt =
					`Premium storybook illustration, ${pick(rng, tones)} tone, ` +
					`${sceneTitle}, featuring ${heroName}, consistent character design, rich detail, no text.`;

				scenes.push({
					scene_id: i,
					scene_index: i,
					scene_title: sceneTitle,
					title: sceneTitle,
					scene_status: "pending_illustration",
					scene_full_text: beat,
					beat,
					illustration_prompt: prompt,
					illustration_url: null,
				});
			}

			storyState = {
				...storyState,
				SceneJSON_array: scenes,
				story_content: {
					...(storyState.story_content || {}),
					SceneJSON_array: scenes,
				},
			};

			mark("scenes_ms", t0);
		}

		// --- Step C: Minimal metadata touch (BindBook pattern) ---
		{
			const t0 = Date.now();
			const finalAuthor = "StorySmith";
			const finalDedication = `Made with care (dev run ${label}).`;

			storyState = {
				...storyState,
				story_content: {
					...(storyState.story_content || {}),
					Cover: {
						...(storyState.story_content?.Cover || {}),
						author_attribution: finalAuthor,
						dedication: finalDedication,
					},
				},
				Cover: {
					...(storyState.Cover || {}),
					author_attribution: finalAuthor,
					dedication: finalDedication,
				},
			};

			mark("finalize_ms", t0);
		}

		const total_ms = Date.now() - startedAt;
		const fingerprintText =
			[
				storyState?.Cover?.cover_image_prompt,
				(storyState.SceneJSON_array || []).map((s) => s.beat).join(" "),
				(storyState.SceneJSON_array || []).map((s) => s.illustration_prompt).join(" "),
			].join(" ");

		return {
			storyState,
			runLog: { label, seed, fixtureType, stepTimings, total_ms },
			fingerprintText,
		};
	}

	async function runGoldenPath() {
		setRunStatus("running");
		setRunLog(null);
		try {
			const seedNum = Number(baseSeed) || Date.now();
			const core = await runGoldenPathCore({ seed: seedNum, label: "single" });

			const defaultTab = fixtureType === "Part1" ? 0 : fixtureType === "Part2" ? 1 : 2;
			try {
				localStorage.setItem(
					"storysmith_dev_fixture_payload",
					JSON.stringify({
						fixtureType: `GoldenPath(${fixtureType})`,
						storyState: core.storyState,
						activeTab: defaultTab,
						runLog: core.runLog,
					})
				);
				localStorage.setItem("storysmith_dev_jump_activeTab", String(defaultTab));
			} catch (e) {
				// eslint-disable-next-line no-console
				console.warn("Failed to store golden path payload", e);
			}

			setRunLog(core.runLog);
			setRunStatus("success");
			router.push("/");
		} catch (err) {
			setRunStatus("error");
			setRunLog({ error: String(err?.message || err) });
		}
	}

	async function runSweep() {
		setSweepStatus("running");
		setSweepResults(null);
		try {
			const n = Math.max(1, Math.min(100, Number(sweepN) || 10));
			const seed0 = (Number(baseSeed) || Date.now()) >>> 0;
			const runs = [];

			for (let i = 0; i < n; i++) {
				// Deterministic seeds per run
				const seed = (seed0 + i * 1013904223) >>> 0;
				const core = await runGoldenPathCore({ seed, label: `run_${i + 1}` });
				runs.push(core);
			}

			const baseline = runs[0]?.fingerprintText || "";
			const scored = runs.map((r, idx) => {
				const sim = idx === 0 ? 0 : jaccard(baseline, r.fingerprintText);
				return {
					index: idx + 1,
					seed: r.runLog.seed,
					total_ms: r.runLog.total_ms,
					stepTimings: r.runLog.stepTimings,
					similarity_to_run1: sim,
					flag_samey: sim >= Number(sameyThreshold),
				};
			});

			const sims = scored.slice(1).map((x) => x.similarity_to_run1);
			const metrics = {
				n,
				baseSeed: seed0,
				threshold: Number(sameyThreshold),
				min_similarity: sims.length ? Math.min(...sims) : 0,
				avg_similarity: sims.length ? sims.reduce((a, b) => a + b, 0) / sims.length : 0,
				max_similarity: sims.length ? Math.max(...sims) : 0,
				flagged_count: scored.filter((x) => x.flag_samey).length,
			};

			setSweepResults({ metrics, scored });
			setSweepStatus("done");
		} catch (err) {
			setSweepStatus("error");
			setSweepResults({ error: String(err?.message || err) });
		}
	}

	function jump() {
		if (!selected?.entry) return;

		// Route stations
		if (selected.entry.kind === "route") {
			if (selected.entry.path === "/projects") {
				router.push("/projects");
				return;
			}
			if (selected.entry.path.startsWith("/viewer")) {
				const id = (viewerBookId || "").trim();
				if (!id) {
					// eslint-disable-next-line no-alert
					alert("Enter a bookId to open the viewer.");
					return;
				}
				router.push(`/viewer/${encodeURIComponent(id)}`);
				return;
			}
			router.push(selected.entry.path);
			return;
		}

		// Tab/Act stations
		if (selected.entry.kind === "tab") {
			try {
				localStorage.setItem("storysmith_dev_jump_activeTab", String(selected.entry.index));
			} catch (e) {
				// eslint-disable-next-line no-console
				console.warn("Failed to set dev jump key", e);
			}
			router.push("/");
		}
	}

	return (
		<div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
			<h1 style={{ fontSize: 22, margin: 0 }}>Golden Path Simulator (Dev)</h1>
			<p style={{ marginTop: 8, opacity: 0.8 }}>
				Dev-only tooling. Requires STORYSMITH_DEVTOOLS=1 and non-production NODE_ENV.
			</p>

			{/* Fixture Panel */}
			<div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
				<strong>Fixture Panel</strong>
				<div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
					<select
						value={fixtureType}
						onChange={(e) => setFixtureType(e.target.value)}
						style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
					>
						<option value="Part1">Part1 (Hero)</option>
						<option value="Part2">Part2 (Story Prompts)</option>
						<option value="Final">Final (Viewer/ActIII)</option>
					</select>
					<button
						onClick={loadFixture}
						style={{
							padding: "10px 12px",
							borderRadius: 8,
							border: "1px solid #222",
							background: "#111",
							color: "#fff",
							cursor: "pointer",
						}}
					>
						Load Fixture → Main App
					</button>
					<div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.75 }}>
						key=storysmith_dev_fixture_payload
					</div>
				</div>
			</div>

			{/* Golden Path Panel */}
			<div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
				<strong>Golden Path Panel</strong>
				<div style={{ marginTop: 10, display: "grid", gap: 10, maxWidth: 720 }}>
					<label style={{ display: "grid", gap: 6 }}>
						<span style={{ fontSize: 12, opacity: 0.8 }}>Base seed (deterministic)</span>
						<input
							value={String(baseSeed)}
							onChange={(e) => setBaseSeed(e.target.value)}
							style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
						/>
					</label>
					<label style={{ display: "grid", gap: 6 }}>
						<span style={{ fontSize: 12, opacity: 0.8 }}>Scene count (dev)</span>
						<input
							value={String(sceneCount)}
							onChange={(e) => setSceneCount(e.target.value)}
							style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
						/>
					</label>
					<div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
						<button
							onClick={runGoldenPath}
							disabled={runStatus === "running"}
							style={{
								padding: "10px 12px",
								borderRadius: 8,
								border: "1px solid #222",
								background: runStatus === "running" ? "#444" : "#111",
								color: "#fff",
								cursor: runStatus === "running" ? "not-allowed" : "pointer",
							}}
						>
							{runStatus === "running" ? "Running…" : "Run Golden Path → Load App"}
						</button>
						<div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.8 }}>
							status={runStatus}
						</div>
					</div>

					{runLog ? (
						<pre
							style={{
								margin: 0,
								padding: 10,
								borderRadius: 8,
								background: "#0b0b0b",
								color: "#eaeaea",
								overflowX: "auto",
								fontSize: 12,
							}}
						>
							{JSON.stringify(runLog, null, 2)}
						</pre>
					) : null}
				</div>
			</div>

			{/* RNG Sweep Panel */}
			<div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
				<strong>RNG Sweep + Similarity</strong>
				<div style={{ marginTop: 10, display: "grid", gap: 10, maxWidth: 720 }}>
					<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
						<label style={{ display: "grid", gap: 6 }}>
							<span style={{ fontSize: 12, opacity: 0.8 }}>N</span>
							<input
								value={String(sweepN)}
								onChange={(e) => setSweepN(e.target.value)}
								style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", width: 120 }}
							/>
						</label>
						<label style={{ display: "grid", gap: 6 }}>
							<span style={{ fontSize: 12, opacity: 0.8 }}>Samey threshold</span>
							<input
								value={String(sameyThreshold)}
								onChange={(e) => setSameyThreshold(e.target.value)}
								style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", width: 160 }}
							/>
						</label>
						<div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
							<button
								onClick={runSweep}
								disabled={sweepStatus === "running"}
								style={{
									padding: "10px 12px",
									borderRadius: 8,
									border: "1px solid #222",
									background: sweepStatus === "running" ? "#444" : "#111",
									color: "#fff",
									cursor: sweepStatus === "running" ? "not-allowed" : "pointer",
								}}
							>
								{sweepStatus === "running" ? "Sweeping…" : "Run Sweep"}
							</button>
							<div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.8 }}>
								status={sweepStatus}
							</div>
						</div>
					</div>

					{sweepResults?.metrics ? (
						<div style={{ display: "grid", gap: 8 }}>
							<div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.9 }}>
								metrics={JSON.stringify(sweepResults.metrics)}
							</div>
							<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
								<button
									onClick={() => downloadJson(`rng_sweep_${Date.now()}.json`, sweepResults)}
									style={{
										padding: "10px 12px",
										borderRadius: 8,
										border: "1px solid #222",
										background: "#fff",
										color: "#111",
										cursor: "pointer",
									}}
								>
									Download JSON
								</button>
							</div>
							<pre
								style={{
									margin: 0,
									padding: 10,
									borderRadius: 8,
									background: "#0b0b0b",
									color: "#eaeaea",
									overflowX: "auto",
									fontSize: 12,
									maxHeight: 260,
								}}
							>
								{JSON.stringify(sweepResults.scored, null, 2)}
							</pre>
						</div>
					) : sweepResults?.error ? (
						<pre
							style={{
								margin: 0,
								padding: 10,
								borderRadius: 8,
								background: "#0b0b0b",
								color: "#eaeaea",
								overflowX: "auto",
								fontSize: 12,
							}}
						>
							{JSON.stringify(sweepResults, null, 2)}
						</pre>
					) : null}
				</div>
			</div>

			{/* Jump Panel */}
			<div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
				<strong>Jump Panel</strong>
				<div style={{ marginTop: 10, display: "grid", gap: 10, maxWidth: 720 }}>
					<label style={{ display: "grid", gap: 6 }}>
						<span style={{ fontSize: 12, opacity: 0.8 }}>Select Station</span>
						<select
							value={selectedStationId}
							onChange={(e) => setSelectedStationId(e.target.value)}
							style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
						>
							{stations.map((s) => (
								<option key={s.id} value={s.id}>
									{s.actId} · {s.type} · {s.title} ({s.id})
								</option>
							))}
						</select>
					</label>

					{selected?.entry?.kind === "route" && selected.entry.path.startsWith("/viewer") ? (
						<label style={{ display: "grid", gap: 6 }}>
							<span style={{ fontSize: 12, opacity: 0.8 }}>Viewer bookId</span>
							<input
								value={viewerBookId}
								onChange={(e) => setViewerBookId(e.target.value)}
								placeholder="e.g. demo-book-123"
								style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
							/>
						</label>
					) : null}

					<div style={{ display: "flex", gap: 10, alignItems: "center" }}>
						<button
							onClick={jump}
							style={{
								padding: "10px 12px",
								borderRadius: 8,
								border: "1px solid #222",
								background: "#111",
								color: "#fff",
								cursor: "pointer",
							}}
						>
							Jump
						</button>
						<div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.8 }}>
							entry={selected?.entry ? JSON.stringify(selected.entry) : "none"}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
