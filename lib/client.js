window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-ui-progress",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region \0dsh-css:E:\deepseek-harness\dsh-ui-progress\src\client\SessionProgressBar.module.css.mjs
		const css = ".Jn-3TW_dock{box-sizing:border-box;width:calc(100% - var(--dsh-composer-side-clearance) - var(--dsh-composer-side-clearance) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));margin:0 auto}.Jn-3TW_bar{box-sizing:border-box;width:100%;max-width:calc(var(--dsh-composer-card-max-width) - 4 * var(--dsh-composer-dock-inset));border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-specific-tip);border-radius:12px;align-items:center;gap:10px;height:36px;margin:0 auto;padding:4px 5px 4px 12px;display:flex}.Jn-3TW_bar[data-state=running]{border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent);animation:2s ease-in-out infinite Jn-3TW_dsh-session-progress-glow}.Jn-3TW_bar[data-state=done]{border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 40%, transparent);background:var(--dsw-alias-state-success-tertiary)}.Jn-3TW_bar[data-state=done] .Jn-3TW_glyph{color:var(--dsw-alias-state-success-primary)}.Jn-3TW_bar[data-state=done] .Jn-3TW_fill{background:var(--dsw-alias-state-success-primary)}.Jn-3TW_bar[data-state=pending]{border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 40%, transparent);background:var(--dsw-alias-state-warn-tertiary);animation:1.6s ease-in-out infinite Jn-3TW_dsh-session-progress-warn-glow}.Jn-3TW_bar[data-state=pending] .Jn-3TW_glyph{color:var(--dsw-alias-state-warn-primary)}.Jn-3TW_bar[data-state=pending] .Jn-3TW_fill{background:var(--dsw-alias-state-warn-primary)}.Jn-3TW_bar[data-state=interrupted]{--ui-progress-interrupted:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 45%, var(--dsw-alias-state-error-primary));border-color:color-mix(in srgb, var(--ui-progress-interrupted) 40%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-warn-tertiary) 85%, var(--dsw-alias-state-error-secondary));animation:1.6s ease-in-out infinite Jn-3TW_dsh-session-progress-interrupted-glow}.Jn-3TW_bar[data-state=interrupted] .Jn-3TW_glyph{color:var(--ui-progress-interrupted)}.Jn-3TW_bar[data-state=interrupted] .Jn-3TW_fill{background:var(--ui-progress-interrupted)}.Jn-3TW_bar[data-state=interrupted] .Jn-3TW_percent{color:var(--ui-progress-interrupted)}@keyframes Jn-3TW_dsh-session-progress-interrupted-glow{0%,to{box-shadow:0 0 0 0 color-mix(in srgb, var(--ui-progress-interrupted) 0%, transparent)}50%{box-shadow:0 0 10px 1px color-mix(in srgb, var(--ui-progress-interrupted) 30%, transparent)}}@keyframes Jn-3TW_dsh-session-progress-warn-glow{0%,to{box-shadow:0 0 0 0 color-mix(in srgb, var(--dsw-alias-state-warn-primary) 0%, transparent)}50%{box-shadow:0 0 10px 1px color-mix(in srgb, var(--dsw-alias-state-warn-primary) 30%, transparent)}}@keyframes Jn-3TW_dsh-session-progress-glow{0%,to{box-shadow:0 0 0 0 color-mix(in srgb, var(--dsw-alias-state-business-primary) 0%, transparent)}50%{box-shadow:0 0 10px 1px color-mix(in srgb, var(--dsw-alias-state-business-primary) 28%, transparent)}}.Jn-3TW_glyph{color:var(--dsw-alias-state-business-primary);flex:none;display:inline-flex}.Jn-3TW_glyphRunning{animation:1s linear infinite Jn-3TW_dsh-session-progress-spin}@keyframes Jn-3TW_dsh-session-progress-spin{to{transform:rotate(360deg)}}.Jn-3TW_label{color:var(--dsw-alias-label-primary);flex:none;font-size:13px;font-weight:500;line-height:24px}.Jn-3TW_track{background:var(--dsw-alias-bg-layer-2);border-radius:999px;flex:1;min-width:60px;height:6px;position:relative;overflow:hidden}.Jn-3TW_fill{background:var(--dsw-alias-state-business-primary);border-radius:999px;transition:width .5s cubic-bezier(.4,0,.2,1);position:absolute;top:0;bottom:0;left:0}.Jn-3TW_fillRunning{background:linear-gradient(90deg, var(--dsw-alias-state-business-primary), var(--dsw-alias-brand-primary))}.Jn-3TW_shimmer{background:linear-gradient(90deg, transparent, color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent), transparent);pointer-events:none;border-radius:999px;width:40%;animation:1.4s ease-in-out infinite Jn-3TW_dsh-session-progress-shimmer;position:absolute;top:0;bottom:0;left:0}@keyframes Jn-3TW_dsh-session-progress-shimmer{0%{transform:translate(-120%)}to{transform:translate(320%)}}.Jn-3TW_counter{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-tertiary);white-space:nowrap;flex:none;font-size:12px;line-height:18px}.Jn-3TW_eta{font-variant-numeric:tabular-nums;color:var(--dsw-alias-state-business-primary);white-space:nowrap;flex:none;font-size:12px;font-weight:500;line-height:18px}.Jn-3TW_rate{text-align:right;font-variant-numeric:tabular-nums;min-width:60px;color:var(--dsw-alias-state-business-primary);white-space:nowrap;flex:none;font-size:12px;font-style:italic;font-weight:500;line-height:18px}.Jn-3TW_percent{text-align:right;font-variant-numeric:tabular-nums;min-width:34px;color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:none;font-size:12px;line-height:18px}";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"@dsh-external/dsh-ui-progress/SessionProgressBar.module.css\"]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@dsh-external/dsh-ui-progress";
			tag.dataset.pluginCss = "@dsh-external/dsh-ui-progress/SessionProgressBar.module.css";
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var SessionProgressBar_module_css_default = {
			"dsh-session-progress-warn-glow": "Jn-3TW_dsh-session-progress-warn-glow",
			"dsh-session-progress-spin": "Jn-3TW_dsh-session-progress-spin",
			"dsh-session-progress-shimmer": "Jn-3TW_dsh-session-progress-shimmer",
			"eta": "Jn-3TW_eta",
			"glyphRunning": "Jn-3TW_glyphRunning",
			"bar": "Jn-3TW_bar",
			"dsh-session-progress-glow": "Jn-3TW_dsh-session-progress-glow",
			"fill": "Jn-3TW_fill",
			"track": "Jn-3TW_track",
			"glyph": "Jn-3TW_glyph",
			"label": "Jn-3TW_label",
			"percent": "Jn-3TW_percent",
			"dsh-session-progress-interrupted-glow": "Jn-3TW_dsh-session-progress-interrupted-glow",
			"fillRunning": "Jn-3TW_fillRunning",
			"rate": "Jn-3TW_rate",
			"shimmer": "Jn-3TW_shimmer",
			"counter": "Jn-3TW_counter",
			"dock": "Jn-3TW_dock"
		};
		//#endregion
		//#region src/client/token-rate.ts
		/**
		* Wide CJK characters priced at one token each: CJK punctuation/forms,
		* kana, CJK ideographs (incl. extension A and compatibility), and hangul.
		* A single regex alternation so a per-character test is stateless.
		*/
		const CJK_CHAR = /[\u3000-\u303F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/;
		/**
		* Non-CJK density: every 4 chars ≈ 1 token (the core token-meter's fixed
		* CHARS_PER_TOKEN). The CJK half diverges on purpose — the meter's flat
		* density is a conservative context-budget heuristic, while a live
		* throughput readout should track real generation, where one CJK char is
		* typically one token. Calibration replaces this static weighting once real
		* provider usage is available.
		*/
		const NARROW_TOKEN_WEIGHT = .25;
		/** Read the provider-reported completion-token count from an assistant node. */
		function usageOutputTokens(usage) {
			if (typeof usage !== "object" || usage === null) return null;
			const value = usage.outputTokens;
			return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
		}
		/**
		* Weighted char measure of assistant content: wide CJK chars count 1.0,
		* remaining chars 0.25 (the fixed non-CJK density). Fractional on purpose —
		* a live estimate must not jump on per-block ceilings, and calibration
		* multiplies this measure by a real tokens-per-weighted-char density.
		* @param blocks - assistant content blocks (text/reasoning bodies, tool-call name + arguments).
		* @returns weighted chars; 0 when nothing is readable.
		*/
		function weightedChars(blocks) {
			let wide = 0;
			let narrow = 0;
			for (const block of blocks) {
				const text = block.kind === "tool-call" ? block.name + block.argsRaw : block.kind === "text" || block.kind === "reasoning" ? block.text : "";
				for (const char of text) if (CJK_CHAR.test(char)) wide += 1;
				else narrow += 1;
			}
			return wide + narrow * NARROW_TOKEN_WEIGHT;
		}
		/**
		* Weighted chars of the in-flight partial, or 0 when the model is not
		* emitting.
		* @param partial - the live streaming partial.
		* @returns the weighted-char measure {@link weightedChars} applies.
		*/
		function weightedPartialChars(partial) {
			return partial === null ? 0 : weightedChars(partial.blocks);
		}
		/**
		* Real tokens-per-weighted-char density of the latest settled assistant step
		* that carries both provider usage and readable content. The density is a
		* property of the model's tokenizer, so any recent completed step in the
		* window calibrates the live estimate (skipping steps without usage or with
		* no measurable content). Nodes are window-scoped and seq-ordered; scanning
		* backwards picks the newest usable sample.
		* @param nodes - settled nodes of the loaded window.
		* @returns tokens per weighted char, or null before any usable step settled.
		*/
		function latestTokenDensity(nodes) {
			for (let i = nodes.length - 1; i >= 0; i -= 1) {
				const node = nodes[i];
				if (node === void 0 || node.kind !== "assistant") continue;
				const output = usageOutputTokens(node.usage);
				if (output === null || output <= 0) continue;
				const weighted = weightedChars(node.blocks);
				if (weighted <= 0) continue;
				return output / weighted;
			}
			return null;
		}
		/**
		* Estimated tokens streamed so far: weighted chars of the partial scaled by
		* the calibrated density when one is available, else the bare weighted-char
		* heuristic (CJK 1 token, others 1/4). Units are consistent either way, so
		* the displayed rate converges smoothly onto the provider's real usage once
		* a step settles.
		* @param partial - the live streaming partial.
		* @param density - calibration from {@link latestTokenDensity}, or null.
		* @returns estimated streamed tokens; 0 while nothing is emitting.
		*/
		function streamedTokenEstimate(partial, density) {
			const weighted = weightedPartialChars(partial);
			if (weighted <= 0) return 0;
			return density === null ? weighted : weighted * density;
		}
		/**
		* Live tokens per second over the decode window (first visible token → now).
		* Mirrors the core's settled reading — output tokens over decode wall time —
		* so the running figure is directly comparable to the post-turn value shown
		* by the conversation StatsLine.
		* @param tokens - estimated streamed tokens ({@link streamedTokenEstimate}).
		* @param firstTokenAt - epoch ms when the first visible token was observed.
		* @param now - epoch ms clock reading.
		* @returns tokens/sec, or null while the window is empty or not yet open.
		*/
		function liveTokenRate(tokens, firstTokenAt, now) {
			const decodeMs = now - firstTokenAt;
			if (tokens <= 0 || decodeMs <= 0) return null;
			return tokens / (decodeMs / 1e3);
		}
		/**
		* Compact rate figure: whole tokens from ten up, one decimal below (same
		* shape as the core's formatTokensPerSecond, which the settled footer uses).
		* @param tps - tokens per second (negatives clamp to zero).
		* @returns display number without unit.
		*/
		function formatTokenRate(tps) {
			const clamped = Math.max(0, tps);
			return clamped >= 10 ? String(Math.round(clamped)) : String(Math.round(clamped * 10) / 10);
		}
		//#endregion
		//#region src/client/timing.ts
		/**
		* Shared timing helpers for the progress surfaces: compact duration
		* formatting and a ticking clock for the live elapsed/ETA readouts. The
		* clock is a component-internal behavioral hook — it subscribes to nothing
		* external (no session or framework state), so it stays inside presentation
		* components. The first-token anchor hook stamps the live token-rate window
		* the same way: from the snapshot's partial alone.
		*/
		/**
		* Compact duration: one decimal always under a minute (17.0s, 3.4s), folded
		* whole-second steps from the minute mark on (1m0s, 2m42s). The fold check
		* uses the rounded tenth so 59.96s reads 1m0s instead of 60.0s.
		* @param ms - duration in milliseconds.
		* @returns display string.
		*/
		function formatElapsed(ms) {
			const tenths = Math.round(ms / 100) / 10;
			if (tenths < 60) return `${tenths.toFixed(1)}s`;
			const whole = Math.round(tenths);
			return `${Math.floor(whole / 60)}m${whole % 60}s`;
		}
		/**
		* Whole-second ETA: 45s / 2m42s / 5h / 5h20m. An estimate, so no sub-second
		* precision; hours kick in at the hour mark.
		* @param ms - remaining-time estimate in milliseconds.
		* @returns display string.
		*/
		function formatEta(ms) {
			const s = Math.max(0, Math.round(ms / 1e3));
			if (s < 60) return `${s}s`;
			if (s < 3600) return `${Math.floor(s / 60)}m${s % 60}s`;
			const hours = Math.floor(s / 3600);
			const minutes = Math.floor(s % 3600 / 60);
			return minutes > 0 ? `${hours}h${minutes}m` : `${hours}h`;
		}
		/**
		* Ticking clock: Date.now() refreshed at the rate the elapsed display
		* needs — every 100ms while the elapsed since `start` is under a minute
		* (0.1s steps), once per second from the minute mark on (folded 1s steps).
		* Frozen when disabled or anchorless; callers gate reads on the same flags.
		* The effect ticks once immediately on enable so a resumed readout is not
		* stale for up to one interval.
		* @param enabled - whether the clock should tick.
		* @param start - epoch-ms anchor the elapsed is measured from (turn start,
		*   call time); null disables the clock.
		* @returns the latest epoch-ms timestamp.
		*/
		function useNow(enabled, start) {
			const [now, setNow] = (0, react.useState)(() => Date.now());
			(0, react.useEffect)(() => {
				if (!enabled || start === null) return;
				let alive = true;
				let timer;
				const tick = () => {
					if (!alive) return;
					setNow(Date.now());
					const delay = Date.now() - start < 6e4 ? 100 : 1e3;
					timer = setTimeout(tick, delay);
				};
				tick();
				return () => {
					alive = false;
					if (timer !== void 0) clearTimeout(timer);
				};
			}, [enabled, start]);
			return now;
		}
		/**
		* First-visible-token anchor for the live token-rate window: the epoch-ms
		* instant the current streaming partial first carried estimated tokens
		* (one render behind the real chunk event at most — a live readout does not
		* need event-exact boundaries). Stamped once per (turn, step): a new step's
		* partial re-opens the decode window, a null partial or a stopped turn
		* closes it.
		* @param running - whether the session turn is running.
		* @param partial - the live streaming partial (snapshot-derived).
		* @returns the anchor, or null while no token stream is live.
		*/
		function useFirstTokenAt(running, partial) {
			const [anchor, setAnchor] = (0, react.useState)(null);
			const key = partial === null ? null : `${partial.turn}\u0000${partial.step}`;
			const hasTokens = partial !== null && weightedPartialChars(partial) > 0;
			const lastKey = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!running || key === null || !hasTokens) {
					lastKey.current = null;
					setAnchor(null);
					return;
				}
				if (lastKey.current !== key) {
					lastKey.current = key;
					setAnchor(Date.now());
				}
			}, [
				running,
				key,
				hasTokens
			]);
			return anchor;
		}
		/**
		* Sliding-window cadence of the live token-rate readout: the displayed tok/s
		* is the average over the most recent window of this length, refreshed once
		* per window — chunk-level arrivals are smoothed into a stable figure that
		* changes at most every window instead of on every stream chunk.
		*/
		const TOKEN_RATE_WINDOW_MS = 1e3;
		/**
		* Sliding-window token rate for the live chip: the average estimated tokens
		* gained per second over the most recent window, recomputed once per window
		* and only when tokens actually arrived (a fully empty window keeps the
		* previous reading so a paused stream does not flicker to zero). A fresh
		* anchor re-opens the window; disabling clears the reading.
		* @param enabled - whether the stream is live (running, no pending wait, anchor set).
		* @param anchor - first-visible-token epoch ms (window origin for the first sample).
		* @param tokens - current estimated streamed tokens (latest per-render value).
		* @param windowMs - smoothing window; defaults to {@link TOKEN_RATE_WINDOW_MS}.
		* @returns the windowed tokens/sec, or null before the first full window or while disabled.
		*/
		function useWindowedTokenRate(enabled, anchor, tokens, windowMs = TOKEN_RATE_WINDOW_MS) {
			const [rate, setRate] = (0, react.useState)(null);
			const windowStartRef = (0, react.useRef)(null);
			const tokensRef = (0, react.useRef)(tokens);
			tokensRef.current = tokens;
			(0, react.useEffect)(() => {
				if (!enabled || anchor === null) {
					windowStartRef.current = null;
					setRate(null);
					return;
				}
				if (windowStartRef.current === null) windowStartRef.current = {
					time: Date.now(),
					tokens: tokensRef.current
				};
				const timer = setInterval(() => {
					const start = windowStartRef.current;
					if (start === null) return;
					const now = Date.now();
					const gained = tokensRef.current - start.tokens;
					if (gained > 0) setRate(liveTokenRate(gained, start.time, now));
					windowStartRef.current = {
						time: now,
						tokens: tokensRef.current
					};
				}, windowMs);
				return () => {
					clearInterval(timer);
				};
			}, [
				enabled,
				anchor,
				windowMs
			]);
			return rate;
		}
		//#endregion
		//#region src/client/args.ts
		/**
		* Parsing helpers for the `report_progress` tool args (model JSON: any field
		* may be missing or mistyped, so every read is shape-checked here once and
		* consumed through these narrow accessors). The browser half reads only the
		* `eta` estimate (the session strip's ETA row); the rest of the contract is
		* the tool's own business.
		*/
		/**
		* Parse the call head's args JSON into a record; malformed or non-object
		* input reads as null.
		* @param argsRaw - the raw JSON string from the call block.
		* @returns the parsed record, or null when it is not a JSON object.
		*/
		function parseArgs(argsRaw) {
			try {
				const parsed = JSON.parse(argsRaw);
				if (typeof parsed !== "object" || parsed === null) return null;
				return parsed;
			} catch {
				return null;
			}
		}
		/**
		* The model-reported ETA as a display string: a number (or numeric string)
		* is seconds formatted compactly ("5h", "2m42s"); any other string is shown
		* verbatim ("约5小时", "~5h"). Null when absent, empty, non-positive, or
		* unparseable — the surface then shows no ETA (unknown stays unknown).
		* @param args - the parsed args record.
		* @returns the display string, or null.
		*/
		function etaOf(args) {
			const eta = args?.eta;
			if (typeof eta === "number" && Number.isFinite(eta) && eta > 0) return formatEta(eta * 1e3);
			if (typeof eta === "string" && eta.trim() !== "") {
				const numeric = eta.trim();
				if (/^\d+(\.\d+)?$/.test(numeric)) {
					const seconds = Number(numeric);
					return Number.isFinite(seconds) && seconds > 0 ? formatEta(seconds * 1e3) : null;
				}
				return eta;
			}
			return null;
		}
		//#endregion
		//#region src/client/session-state.ts
		/**
		* Count settled tool results in the current snapshot window. The node stream
		* is the presentation-truth source: a result node exists exactly when a tool
		* call completed (and re-renders live as the window advances).
		*/
		function settledToolCount(legacy) {
			let count = 0;
			for (const node of legacy.nodes) if (node.kind === "tool-result") count += 1;
			return count;
		}
		/**
		* True while the model is emitting reasoning: the in-flight partial carries a
		* reasoning block and no tool call is in flight (a running tool is the more
		* specific state and wins the label).
		*/
		function isReasoning(legacy) {
			return legacy.partial?.blocks.some((block) => block.kind === "reasoning") ?? false;
		}
		/** The in-flight tool name when running; undefined when nothing is executing. */
		function runningTool(legacy) {
			return legacy.runningCalls[0]?.name;
		}
		/**
		* Start time of the running turn — the in-window turn entry with no end yet.
		* Null when running but no in-window turn start exists.
		*/
		function runningTurnStart(legacy) {
			let start = null;
			for (const timing of legacy.turnTimings.values()) if (timing.endTime === void 0) start = timing.startTime;
			return start;
		}
		/**
		* Wall duration of the last settled in-window turn; null when no turn has
		* finished yet. Only read while idle (the running turn has no end entry).
		*/
		function lastTurnDuration(legacy) {
			let duration = null;
			for (const timing of legacy.turnTimings.values()) if (timing.endTime !== void 0) duration = Math.max(0, timing.endTime - timing.startTime);
			return duration;
		}
		/**
		* The model-reported ETA display string from the LATEST in-window
		* `report_progress` call (running or settled, by report time). The latest
		* report is the model's last word: if it carries no eta, the strip shows no
		* ETA even when an older report did.
		*/
		function latestReportEta(legacy) {
			let latestTime = -1;
			let latestEta = null;
			for (const node of legacy.nodes) {
				if (node.kind !== "tool-result" || node.call?.name !== "report_progress") continue;
				const time = node.callTime ?? node.time;
				if (time >= latestTime) {
					latestTime = time;
					latestEta = etaOf(parseArgs(node.call.argsRaw));
				}
			}
			for (const call of legacy.runningCalls) {
				if (call.name !== "report_progress") continue;
				if (call.time >= latestTime) {
					latestTime = call.time;
					latestEta = etaOf(parseArgs(call.argsRaw));
				}
			}
			return latestEta;
		}
		/** Completed/active/total from a live todos projection; null when unavailable or empty. */
		function todoCounts(todos) {
			if (todos === void 0 || todos === null || todos.length === 0) return null;
			let done = 0;
			let active = 0;
			for (const item of todos) if (item.status === "completed") done += 1;
			else if (item.status === "in_progress") active += 1;
			return {
				done,
				active,
				total: todos.length
			};
		}
		/**
		* The bar's progress value in 0..100. A live `todos` projection wins: the
		* (completed + in-progress)/total ratio is the real task completion — the
		* in-flight task counts toward progress, so five tasks with two done and one
		* in progress reads 60%. Without one the fill rests at its 100% default:
		* session-overall progress has no dedicated projection, and a fake percentage
		* (the removed per-tool-result window segments) is worse than none.
		*/
		function progressPercent(legacy, todos) {
			const counts = todoCounts(todos);
			if (counts !== null) return Math.round((counts.done + counts.active) / counts.total * 100);
			return 100;
		}
		/**
		* Turn/end reasons that mean the latest turn was stopped mid-flight. DSH
		* 0.1.x ends an aborted turn with kind 'aborted' (manual stop/cancel) and a
		* crash repair closes a cut-short turn with 'interrupted'; both must tint the
		* bar. 'error' stays out of this set — the turn-error node below covers it.
		*/
		const INTERRUPTED_TURN_REASONS = /* @__PURE__ */ new Set(["aborted", "interrupted"]);
		/**
		* Tool-result error codes that mark a call cut short by a stop or a crash
		* repair. 'interrupted' is the pre-0.1.x marker; 0.1.x uses
		* 'ABORTED_BEFORE_DISPATCH' (call cancelled before dispatch) and the repair
		* codes 'TOOL_OUTCOME_UNKNOWN' / 'TOOL_NOT_STARTED' (started/never-started
		* call whose outcome the backend cannot know).
		*/
		const INTERRUPTED_ERROR_CODES = /* @__PURE__ */ new Set([
			"interrupted",
			"ABORTED_BEFORE_DISPATCH",
			"TOOL_OUTCOME_UNKNOWN",
			"TOOL_NOT_STARTED"
		]);
		/**
		* Whether the session's LATEST completed turn was stopped mid-flight — a
		* manual stop, an API failure, or another unexpected break.
		*
		* Primary signal (DSH 0.1.x): the latest completed turn's `turn/end` reason,
		* read off the Chat view's timeline — a stop leaves no per-node trace for
		* every case (no partial content to freeze, no in-flight call to error), but
		* the turn always ends with reason 'aborted' (cancel) or 'interrupted'
		* (repair). `lastAgentError` comes from the Session lifecycle snapshot
		* (live agent failures with no turn position).
		*
		* Fallback (windowed node traces, covers older hosts and error-ended turns):
		* an interrupted assistant node (frozen partial), tool-result nodes whose
		* error code marks a cut-off call, and turn-error nodes (terminal failure).
		* Only the latest completed turn is judged (its turn/end seq is the
		* boundary — derived interruption nodes ride fractional seqs just below
		* it), so an interruption followed by a clean turn does not keep the bar
		* orange. Window-scoped by design — paging or compaction drops old markers.
		*/
		function latestTurnInterrupted(chat, legacy, lastAgentError) {
			if (lastAgentError !== null) return true;
			const turns = chat?.timeline.turns;
			if (turns !== void 0) {
				const reason = ([...turns.entries()].sort((a, b) => a[0] - b[0]).at(-1)?.[1])?.end?.data?.reason?.kind;
				if (reason !== void 0 && INTERRUPTED_TURN_REASONS.has(reason)) return true;
			}
			const ends = [...legacy.turnEnds.entries()].sort((a, b) => a[0] - b[0]);
			const latestEnd = ends.at(-1);
			if (latestEnd === void 0) return false;
			const latestEndSeq = latestEnd[1];
			const prevEndSeq = ends.at(-2)?.[1] ?? 0;
			for (const node of legacy.nodes) {
				if (node.seq <= prevEndSeq || node.seq > latestEndSeq) continue;
				if (node.kind === "assistant" && node.interrupted === true) return true;
				if (node.kind === "turn-error") return true;
				if (node.kind === "tool-result") {
					const err = node.error;
					const code = err?.code ?? err?.info?.code;
					if (code !== void 0 && INTERRUPTED_ERROR_CODES.has(code)) return true;
				}
			}
			return false;
		}
		//#endregion
		//#region src/client/SessionProgressBar.tsx
		/**
		* SessionProgressBar: a resident session-progress strip in the composer
		* input dock, derived entirely from the live Chat view snapshot (via the
		* standard `useConversation` seat) plus the dock owner's Session lifecycle
		* snapshot and the `todos` session projection.
		*
		* The bar needs no model-facing tool: it reads the framework's standard
		* seats and renders the real execution state — whether the turn is running,
		* which tool call is in flight, whether the model is emitting reasoning, and
		* the task completion ratio. Node, timing, and streaming data come from the
		* Chat view's legacy compatibility projection (`.legacy`); the turn/end
		* interruption signal comes from the Chat view's timeline; running state and
		* lastAgentError come from the Session snapshot. Progress follows the truth
		* order: a live todos list wins (completed/total is the real task
		* completion — five tasks with two done reads 40%); without one the fill
		* rests at its 100% default, because session-overall progress has no
		* dedicated projection and a fake percentage is worse than none. Animation
		* follows the state: a spinning glyph and shimmer glide while running, a
		* static filled bar when idle.
		*
		* While running, the strip also shows a live elapsed readout (since the
		* current turn started). The ETA is never extrapolated: it rides the model's
		* own knowledge — the latest in-window `report_progress` call's `eta`
		* argument (a rough remaining-time estimate). When the model has not
		* reported one, no ETA shows (unknown stays unknown).
		*
		* Attention state: when this session or any descendant subagent session
		* waits on a human interaction (approval / question / plan review), the bar
		* switches to the amber warning palette and the label names the wait — the
		* session's own wait reads through the global `useSessionPendingInteraction`
		* seat; subagent waits surface through the same map plus the global session
		* list (`origin: 'subagent'` rows carry `parentId`; the sidebar hides
		* them, so this strip is where the main agent surfaces them).
		*
		* Interrupted state: when the session's latest completed turn was stopped —
		* a manual stop, an API failure, or another unexpected break — the bar
		* switches to the orange-red palette with a slow pulse and the label reads
		* 已中断. Only the latest completed turn is judged (by its turn/end seq), so
		* an interruption followed by a clean turn does not keep the bar orange.
		*
		* Live token rate (v0.9.0): while the model is emitting (running with a
		* non-empty partial and no pending human interaction), the strip shows a
		* live generation-rate readout — estimated tokens over the decode window
		* since the first visible token. Streaming chunks carry no token counts, so
		* the figure is an estimate that self-calibrates to the model's real
		* tokenizer density from the latest settled step's provider usage (CJK-aware
		* char heuristic before the first calibrated step; see token-rate.ts), and
		* is smoothed through a sliding window so the readout changes at most once
		* per second instead of on every chunk. Measured from the same first-token
		* anchor the core uses for its settled tokens/s, the live number is directly
		* comparable to the post-turn value on the conversation StatsLine.
		*/
		/**
		* Stable empty legacy slice for sessions whose Chat view target has not
		* registered yet (module-level so the fallback reference never moves).
		*/
		const EMPTY_LEGACY = {
			nodes: [],
			turnTimings: /* @__PURE__ */ new Map(),
			turnEnds: /* @__PURE__ */ new Map(),
			partial: null,
			runningCalls: []
		};
		/** Narrow a pending-interaction discriminator to the labeled kinds. */
		function pendingKindOf(kind) {
			if (kind === "approval" || kind === "question" || kind === "plan-review") return kind;
			return null;
		}
		/**
		* Walk the session list from the given root down its `parentId` chain and
		* count pending human interactions on subagent sessions. The sidebar hides
		* subagent rows; the pending-interaction map still carries them, so the
		* main strip can surface their waits.
		* @param byId - the global session-list index.
		* @param pending - pending interactions by session id.
		* @param rootId - the strip's owning session id.
		* @returns pending counts per kind across the whole subtree.
		*/
		function subagentPendingState(byId, pending, rootId) {
			const children = /* @__PURE__ */ new Map();
			for (const [sid, row] of Object.entries(byId)) {
				if (row.parentId === void 0 || row.origin !== "subagent") continue;
				const list = children.get(row.parentId) ?? [];
				list.push(sid);
				children.set(row.parentId, list);
			}
			const seen = /* @__PURE__ */ new Set([rootId]);
			const queue = [rootId];
			let approvals = 0;
			let questions = 0;
			let plans = 0;
			while (queue.length > 0) {
				const id = queue.shift();
				for (const childId of children.get(id) ?? []) {
					if (seen.has(childId)) continue;
					seen.add(childId);
					queue.push(childId);
					const kind = pendingKindOf(pending.get(childId)?.kind);
					if (kind === "approval") approvals += 1;
					else if (kind === "question") questions += 1;
					else if (kind === "plan-review") plans += 1;
				}
			}
			return {
				approvals,
				questions,
				plans
			};
		}
		/**
		* The attention label: this session's own wait (approval/question/plan
		* review) plus the subagent subtree's waits, combined with a separator when
		* both exist.
		*/
		function pendingLabel(ownKind, sub, t) {
			const ownText = ownKind === "approval" ? t("bar.pendingApproval") : ownKind === "question" ? t("bar.pendingQuestion") : ownKind === "plan-review" ? t("bar.pendingPlan") : null;
			const total = sub.approvals + sub.questions + sub.plans;
			let subText = null;
			if (total > 0) if (total === 1 && sub.approvals === 1) subText = t("bar.pendingSubagentApproval");
			else if (total === 1 && sub.questions === 1) subText = t("bar.pendingSubagentQuestion");
			else if (total === 1 && sub.plans === 1) subText = t("bar.pendingSubagentPlan");
			else subText = t("bar.pendingSubagentCount", { count: total });
			if (ownText !== null && subText !== null) return `${ownText} · ${subText}`;
			return ownText ?? subText ?? "";
		}
		/** Human label for the current state; null means the dock row renders no text. */
		function stateLabel(running, runningToolName, thinking, counts, t) {
			if (running) {
				if (runningToolName !== void 0) return t("bar.tool", { name: runningToolName });
				if (thinking) return t("bar.thinking");
				return t("bar.running");
			}
			if (counts !== null) return t("bar.todos", {
				done: counts.done,
				active: counts.active,
				total: counts.total
			});
			return t("bar.idle");
		}
		/**
		* Resident progress strip. Renders nothing until a session snapshot exists
		* (the no-session hero has no dock content), then shows the state text, the
		* animated fill bar with a live percent readout, the turn/tool counters, and
		* — while running — the live elapsed plus the model-reported ETA (or the
		* last settled turn's duration when idle). Pending human interactions (this
		* session or its subagent subtree) and interrupted stops (manual or
		* unexpected) each override the plain states with their attention palette.
		*/
		function SessionProgressBar({ session, sessionId, t, useConversation, useProjection, useSessions, useSessionPendingInteraction }) {
			if (session === void 0 || session === null) return null;
			const chat = useConversation((conversation) => conversation.views.get("chat"));
			const legacy = chat?.legacy ?? EMPTY_LEGACY;
			const todos = useProjection("todos");
			const toolName = runningTool(legacy);
			const running = session.running;
			const thinking = running && toolName === void 0 && isReasoning(legacy);
			const counts = todoCounts(todos);
			const percent = progressPercent(legacy, todos);
			const turn = legacy.turnTimings.size;
			const settled = settledToolCount(legacy);
			const turnStart = runningTurnStart(legacy);
			const now = useNow(running, turnStart);
			const elapsed = turnStart !== null ? Math.max(0, now - turnStart) : null;
			const partial = legacy.partial;
			const firstTokenAt = useFirstTokenAt(running, partial);
			const modelEta = running ? latestReportEta(legacy) : null;
			const lastTurn = running ? null : lastTurnDuration(legacy);
			const completed = !running && turn > 0;
			const pendingBySession = useSessionPendingInteraction((interactions) => interactions);
			const ownPending = pendingKindOf(pendingBySession.get(sessionId)?.kind);
			const subPending = subagentPendingState(useSessions((s) => s.byId), pendingBySession, sessionId);
			const pending = ownPending !== null || subPending.approvals + subPending.questions + subPending.plans > 0;
			const interrupted = !running && latestTurnInterrupted(chat, legacy, session.lastAgentError);
			const density = latestTokenDensity(legacy.nodes);
			const tokenRate = useWindowedTokenRate(running && !pending && firstTokenAt !== null, firstTokenAt, streamedTokenEstimate(partial, density), TOKEN_RATE_WINDOW_MS);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: SessionProgressBar_module_css_default.dock,
				"data-progress-bar": true,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: SessionProgressBar_module_css_default.bar,
					"data-state": pending ? "pending" : running ? "running" : interrupted ? "interrupted" : completed ? "done" : "idle",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: clsx(SessionProgressBar_module_css_default.glyph, running && SessionProgressBar_module_css_default.glyphRunning),
							children: running ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutline16, { size: 14 }) : interrupted ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkle16, { size: 14 })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SessionProgressBar_module_css_default.label,
							children: pending ? pendingLabel(ownPending, subPending, t) : interrupted ? t("bar.interrupted") : stateLabel(running, toolName, thinking, counts, t)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SessionProgressBar_module_css_default.track,
							role: "progressbar",
							"aria-valuenow": percent,
							"aria-valuemin": 0,
							"aria-valuemax": 100,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: clsx(SessionProgressBar_module_css_default.fill, running && SessionProgressBar_module_css_default.fillRunning),
								style: { width: `${percent}%` }
							}), running && !pending && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: SessionProgressBar_module_css_default.shimmer })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: SessionProgressBar_module_css_default.percent,
							children: [percent, "%"]
						}),
						running && modelEta !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SessionProgressBar_module_css_default.eta,
							children: t("bar.eta", { duration: modelEta })
						}),
						running && elapsed !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SessionProgressBar_module_css_default.counter,
							children: t("bar.elapsed", { duration: formatElapsed(elapsed) })
						}),
						running && tokenRate !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SessionProgressBar_module_css_default.rate,
							children: t("bar.tokenRate", { rate: formatTokenRate(tokenRate) })
						}),
						!running && lastTurn !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SessionProgressBar_module_css_default.counter,
							children: t("bar.lastTurn", { duration: formatElapsed(lastTurn) })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SessionProgressBar_module_css_default.counter,
							children: t("bar.turn", { turn })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SessionProgressBar_module_css_default.counter,
							children: t("bar.tools", { count: settled })
						})
					]
				})
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** `progress` namespace dictionaries. */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"bar.idle": "会话就绪",
			"bar.running": "正在执行",
			"bar.thinking": "正在思考",
			"bar.todos": "已完成 {done}/{total}",
			"bar.turn": "第 {turn} 轮",
			"bar.tools": "{count} 个工具调用",
			"bar.tool": "工具 {name}",
			"bar.waiting": "等待输入",
			"bar.elapsed": "已耗时 {duration}",
			"bar.eta": "预计剩余 {duration}",
			"bar.tokenRate": "{rate} tok/s",
			"bar.lastTurn": "上回合 {duration}",
			"bar.interrupted": "已中断",
			"bar.pendingApproval": "等待审批",
			"bar.pendingQuestion": "需要选择",
			"bar.pendingPlan": "等待计划审阅",
			"bar.pendingSubagentApproval": "子代理等待审批",
			"bar.pendingSubagentQuestion": "子代理需要选择",
			"bar.pendingSubagentPlan": "子代理等待计划审阅",
			"bar.pendingSubagentCount": "子代理 {count} 项待处理"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"bar.idle": "Session idle",
			"bar.running": "Executing",
			"bar.thinking": "Thinking",
			"bar.todos": "Done {done}/{total}",
			"bar.turn": "Turn {turn}",
			"bar.tools": "{count} tool calls",
			"bar.tool": "Tool {name}",
			"bar.waiting": "Waiting for input",
			"bar.elapsed": "Elapsed {duration}",
			"bar.eta": "ETA {duration}",
			"bar.tokenRate": "{rate} tok/s",
			"bar.lastTurn": "Last turn {duration}",
			"bar.interrupted": "Interrupted",
			"bar.pendingApproval": "Awaiting approval",
			"bar.pendingQuestion": "Needs selection",
			"bar.pendingPlan": "Awaiting plan review",
			"bar.pendingSubagentApproval": "Subagent awaiting approval",
			"bar.pendingSubagentQuestion": "Subagent needs selection",
			"bar.pendingSubagentPlan": "Subagent awaiting plan review",
			"bar.pendingSubagentCount": "Subagent {count} pending"
		};
		//#endregion
		//#region src/client/compat.ts
		/**
		* Graceful-compatibility helper: instead of throwing when the running DSH
		* client API no longer matches what this plugin needs, render a fixed-position
		* remediation banner and degrade. Pure DOM (appended to document.body), so it
		* works regardless of which slots/services the host still provides.
		*/
		/** Escape one text value for interpolation into the banner's innerHTML. */
		function escapeHtml(value) {
			return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
		}
		/** Fixed-position banner styling; injected once the first banner mounts. */
		const BANNER_CSS = [
			"position:fixed",
			"z-index:2147483000",
			"right:12px",
			"bottom:12px",
			"max-width:min(380px,calc(100vw - 24px))",
			"background:#1e2430",
			"color:#e6ebf2",
			"border:1px solid #f0a52a",
			"border-radius:10px",
			"padding:12px 14px",
			"font:13px/1.6 system-ui,Segoe UI,sans-serif",
			"box-shadow:0 8px 24px rgba(0,0,0,.35)"
		].join(";");
		/** One remediation banner; duplicates by id are dropped, click dismisses. */
		function renderCompatBanner(id, pluginName, cause, steps) {
			if (typeof document === "undefined") return;
			if (document.querySelector(`[data-dsh-compat-banner="${id}"]`) !== null) return;
			const el = document.createElement("div");
			el.setAttribute("data-dsh-compat-banner", id);
			el.setAttribute("role", "alert");
			el.setAttribute("style", BANNER_CSS);
			const list = steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
			el.innerHTML = [
				`<div style="font-weight:600;margin-bottom:4px">${escapeHtml(pluginName)} 与当前 DSH 不兼容</div>`,
				`<div style="margin-bottom:6px">原因：${escapeHtml(cause)}</div>`,
				`<div style="margin-bottom:4px">解决：</div>`,
				`<ol style="margin:0;padding-left:18px">${list}</ol>`,
				`<div style="margin-top:8px;color:#9aa4b2">点击关闭 · 更新后刷新页面即可</div>`
			].join("");
			el.addEventListener("click", () => {
				el.remove();
			});
			document.body.appendChild(el);
		}
		/** Fail-closed feature check: every required capability must be present. */
		function requireCapabilities(checks) {
			const missing = [];
			for (const [label, value] of checks) if (value === void 0 || value === null) missing.push(label);
			return missing;
		}
		/** Wrapper: run a plugin body, and on any missing capability or thrown error
		* render the remediation banner instead of crashing. */
		function applyWithCompat(pluginName, cause, steps, checks, body) {
			const missing = requireCapabilities(checks);
			if (missing.length > 0) {
				renderCompatBanner(pluginName, pluginName, `${cause}(缺失：${missing.join("、")})`, steps);
				return;
			}
			try {
				body();
			} catch (error) {
				renderCompatBanner(pluginName, pluginName, `${cause}(错误：${String(error?.message ?? error)})`, steps);
			}
		}
		//#endregion
		//#region src/client/update-check.ts
		/**
		* Client-side version check + click-to-update for the whale update chip.
		* Version query prefers the host same-origin endpoint (no GitHub CORS), then
		* the GitHub tags API / raw package.json as fallback.
		*/
		const PLUGIN_VERSION = "0.9.14";
		const MIRROR = "lhh010/dsh-ui-progress";
		const UPDATE_ID = "dsh-ui-progress";
		const PACKAGE_SPEC = "@dsh-external/dsh-ui-progress";
		function compareSemver(a, b) {
			const parse = (v) => {
				const p = v.replace(/^v/, "").split(".").map((x) => Number(x) || 0);
				while (p.length < 3) p.push(0);
				return p;
			};
			const pa = parse(a);
			const pb = parse(b);
			return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
		}
		async function latestFromHost() {
			try {
				const res = await fetch(`/${UPDATE_ID}/latest`, {
					method: "GET",
					signal: AbortSignal.timeout(9e3)
				});
				if (!res.ok) return void 0;
				const latest = (await res.json()).latest;
				return typeof latest === "string" && /^v\d+\.\d+\.\d+$/.test(latest) ? latest : void 0;
			} catch {
				return;
			}
		}
		async function latestFromTags() {
			try {
				const res = await fetch(`https://api.github.com/repos/${MIRROR}/tags?per_page=10`, {
					headers: { accept: "application/vnd.github+json" },
					signal: AbortSignal.timeout(8e3)
				});
				if (!res.ok) return void 0;
				const tags = await res.json();
				if (!Array.isArray(tags)) return void 0;
				const stable = tags.map((e) => e.name).filter((n) => typeof n === "string" && /^v\d+\.\d+\.\d+$/.test(n));
				if (stable.length === 0) return void 0;
				return stable.reduce((newest, t) => compareSemver(t, newest) > 0 ? t : newest);
			} catch {
				return;
			}
		}
		async function latestFromRaw() {
			try {
				const res = await fetch(`https://raw.githubusercontent.com/${MIRROR}/main/package.json`, { signal: AbortSignal.timeout(8e3) });
				if (!res.ok) return void 0;
				const version = (await res.json()).version;
				return typeof version === "string" && /^\d+\.\d+\.\d+$/.test(version) ? `v${version}` : void 0;
			} catch {
				return;
			}
		}
		async function fetchLatestTag() {
			const [host, tags, raw] = await Promise.all([
				latestFromHost(),
				latestFromTags(),
				latestFromRaw()
			]);
			return host ?? tags ?? raw;
		}
		function updatePrompt(tag) {
			return [
				`帮我更新 ${UPDATE_ID} 插件到 ${tag}，步骤：`,
				`0. 先执行 dsh --version 确认本地 DSH 版本，并对照 https://github.com/${MIRROR} 的 README「版本兼容」表——不同 DSH 版本需安装不同插件 tag，装错版本会启动崩溃；若本提示词给的 tag 与你的 DSH 版本不匹配，请改装表中对应 tag`,
				`1. 执行 dsh plugin --profile web add '${PACKAGE_SPEC}@github:${MIRROR}#${tag}'（首次可能被 pnpm 11 拦截构建脚本，则先在 ~/.dsh/profiles/web 执行 pnpm approve-builds --all）`,
				"2. 完成后提醒我硬刷新浏览器（Ctrl/Cmd+Shift+R）",
				`3. 遇到安装失败 / 版本不匹配 / 启动报错：先查 https://github.com/${MIRROR} README 的「版本兼容」与「已知限制」章节再排查`
			].join("\n");
		}
		async function runUpdate(tag) {
			try {
				const res = await fetch(`/${UPDATE_ID}/update`, {
					method: "POST",
					headers: {
						"content-type": "application/json",
						"x-dsh-plugin-update": "click"
					},
					body: JSON.stringify({ tag }),
					signal: AbortSignal.timeout(13e4)
				});
				const parsed = await res.json().catch(() => ({}));
				return {
					ok: res.ok && parsed.ok === true,
					detail: typeof parsed.output === "string" ? parsed.output : parsed.error ?? String(res.status),
					link: parsed.link === true,
					...typeof parsed.recovery === "string" ? { recovery: parsed.recovery } : {},
					...parsed.hostChanged === true ? { hostChanged: true } : {}
				};
			} catch (e) {
				return {
					ok: false,
					detail: String(e?.message ?? e)
				};
			}
		}
		//#endregion
		//#region src/client/update-chip.ts
		/**
		* Floating update chip: appears once when a newer version exists; click updates
		* via the host endpoint (falling back to copying the prompt). Self-contained
		* fixed DOM with a close (×) button; all `[data-update-chip]` elements across
		* plugins are stacked into one non-overlapping column by a shared relayout, so
		* update prompts never overlap each other. When the version check fails
		* (network unreachable), a neutral gray chip with a retry button shows instead.
		*/
		let started = false;
		function startUpdateChip() {
			if (started) return;
			started = true;
			fetchLatestTag().then((tag) => {
				if (tag === void 0) {
					renderOfflineChip();
					return;
				}
				if (compareSemver(tag, PLUGIN_VERSION) <= 0) {
					renderCurrentChip(tag);
					return;
				}
				renderChip(tag);
			});
		}
		/** Reflow every visible update chip into a non-overlapping vertical column. */
		function relayout() {
			const chips = Array.from(document.querySelectorAll("[data-update-chip]"));
			let next = 12;
			for (const chip of chips) {
				chip.style.bottom = `${next}px`;
				next += chip.getBoundingClientRect().height + 8;
			}
		}
		const LABEL = "进度条";
		function renderChip(tag) {
			if (document.querySelector(`[data-update-chip="dsh-ui-progress"]`) !== null) return;
			const el = document.createElement("div");
			el.setAttribute("data-update-chip", UPDATE_ID);
			el.setAttribute("role", "button");
			el.setAttribute("title", `更新到 ${tag}`);
			el.style.cssText = "position:fixed;left:12px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #4a7dff;border-radius:10px;background:#1e2430;color:#cfe0ff;font:12px/1.4 system-ui,Segoe UI,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35);";
			const label = document.createElement("span");
			label.style.cssText = "pointer-events:none;";
			label.textContent = `⟳ ${LABEL} 新版本 ${tag} 可用，点击更新`;
			const close = document.createElement("button");
			close.textContent = "×";
			close.setAttribute("aria-label", "关闭");
			close.title = "关闭";
			close.style.cssText = "pointer-events:auto;border:0;background:transparent;color:#8fa3c8;font:inherit;cursor:pointer;padding:0 2px;line-height:1;";
			close.addEventListener("click", (event) => {
				event.stopPropagation();
				el.remove();
				relayout();
			});
			el.appendChild(label);
			el.appendChild(close);
			el.addEventListener("pointerdown", (event) => {
				event.stopPropagation();
			});
			el.addEventListener("click", () => {
				label.textContent = "更新中…";
				runUpdate(tag).then((result) => {
					if (result.ok) {
						label.textContent = result.hostChanged === true ? `已更新到 ${tag}（含宿主侧变更），请重启 dsh 生效` : `已更新到 ${tag}，客户端自动刷新生效（未见变化可硬刷新 Ctrl/Cmd+Shift+R）`;
						el.setAttribute("title", "已更新，硬刷新生效");
						return;
					}
					if (result.link) {
						navigator.clipboard?.writeText(updatePrompt(tag)).then(() => {
							label.textContent = `本地 link 安装：已跳过自动更新，更新提示词已复制到剪贴板`;
						}).catch(() => {
							label.textContent = `本地 link：请手动执行 pnpm add '${PACKAGE_SPEC}@github:${MIRROR}#${tag}'`;
						});
						el.setAttribute("title", "悬停查看本地 link 说明");
						return;
					}
					navigator.clipboard?.writeText(updatePrompt(tag)).then(() => {
						label.textContent = `自动更新失败（详见剪贴板提示词）：${result.detail.slice(0, 80)}`;
					}).catch(() => {
						label.textContent = `自动更新失败：${result.detail.slice(0, 80)}`;
					});
					el.setAttribute("title", result.recovery !== void 0 ? `${result.detail}\n恢复命令：${result.recovery}` : result.detail);
				});
			});
			document.body.appendChild(el);
			relayout();
		}
		/** Neutral gray chip shown when the version check cannot reach the network. */
		function renderOfflineChip() {
			if (document.querySelector(`[data-update-chip="dsh-ui-progress"]`) !== null) return;
			const el = document.createElement("div");
			el.setAttribute("data-update-chip", UPDATE_ID);
			el.setAttribute("title", "无法连接宿主端点 / GitHub 查询新版本（可能是网络不可达）");
			el.style.cssText = "position:fixed;left:12px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #4a5060;border-radius:10px;background:#22252c;color:#9aa3b5;font:12px/1.4 system-ui,Segoe UI,sans-serif;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3);";
			const label = document.createElement("span");
			label.style.cssText = "pointer-events:none;";
			label.textContent = `⚠ ${LABEL} 版本检查失败（网络不可达），点击重试`;
			const retry = document.createElement("button");
			retry.textContent = "重试";
			retry.setAttribute("aria-label", "重试版本检查");
			retry.style.cssText = "pointer-events:auto;border:0;background:transparent;color:#8fa3c8;font:inherit;cursor:pointer;padding:0 2px;line-height:1;";
			const close = document.createElement("button");
			close.textContent = "×";
			close.setAttribute("aria-label", "关闭");
			close.title = "关闭";
			close.style.cssText = "pointer-events:auto;border:0;background:transparent;color:#8fa3c8;font:inherit;cursor:pointer;padding:0 2px;line-height:1;";
			close.addEventListener("click", (event) => {
				event.stopPropagation();
				el.remove();
				relayout();
			});
			el.appendChild(label);
			el.appendChild(retry);
			el.appendChild(close);
			let retrying = false;
			const retryOnce = () => {
				if (retrying) return;
				retrying = true;
				label.textContent = "版本检查中…";
				fetchLatestTag().then((tag) => {
					retrying = false;
					if (tag === void 0) {
						label.textContent = `⚠ ${LABEL} 仍无法查询新版本`;
						return;
					}
					el.remove();
					relayout();
					if (compareSemver(tag, PLUGIN_VERSION) > 0) renderChip(tag);
				});
			};
			retry.addEventListener("click", (event) => {
				event.stopPropagation();
				retryOnce();
			});
			el.addEventListener("click", (event) => {
				if (event.target.closest("button") === null) retryOnce();
			});
			document.body.appendChild(el);
			relayout();
		}
		/** Transient confirmation when the check succeeds and we are already current. */
		function renderCurrentChip(tag) {
			if (document.querySelector(`[data-update-chip="dsh-ui-progress"]`) !== null) return;
			const el = document.createElement("div");
			el.setAttribute("data-update-chip", UPDATE_ID);
			el.setAttribute("title", "版本检查成功，当前已是最新版本");
			el.style.cssText = "position:fixed;left:12px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #2f5d3a;border-radius:10px;background:#1c2a22;color:#9fd8ae;font:12px/1.4 system-ui,Segoe UI,sans-serif;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3);";
			const label = document.createElement("span");
			label.style.cssText = "pointer-events:none;";
			label.textContent = `✓ ${LABEL} 已是最新版本 ${tag}`;
			el.appendChild(label);
			el.addEventListener("pointerdown", (event) => {
				event.stopPropagation();
			});
			el.addEventListener("click", () => {
				el.remove();
				relayout();
			});
			document.body.appendChild(el);
			relayout();
			setTimeout(() => {
				el.remove();
				relayout();
			}, 4e3);
		}
		//#endregion
		//#region src/client/index.ts
		/**
		* Client plugin body: register the `progress` dictionaries and the resident
		* session-progress strip into the input dock. The dock slot is declared by
		* ui-conversation's apply; `slots.inject` waits on that declaration,
		* reruns after redeclaration, and rolls back with this plugin's fiber.
		* @param ctx - client root context.
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "progress";
		/** Required services (cordis fiber inject): the slots registry and the locale seat. */
		const inject = ["slots", "locale"];
		function apply(ctx) {
			startUpdateChip();
			applyWithCompat("@dsh-external/dsh-ui-progress", "当前 DSH 客户端 API 与插件不匹配", [
				"将 DSH 升级到已适配的版本（dsh-v0.1.2-alpha.1，源码构建安装）。",
				"或将插件更新到适配当前 DSH 的版本（仓库最新 tag）。",
				"如仍显示，请在插件目录执行 pnpm run build 后刷新页面。"
			], [
				["slots.inject", ctx?.slots?.inject],
				["slots.register", ctx?.slots?.register],
				["locale.register", ctx?.locale?.register]
			], () => {
				ctx.effect(() => ctx.locale.register(NS, {
					zh,
					en
				}), "ui-progress: dictionaries");
				ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
					name: "conversation.input.dock",
					id: "progress",
					order: 20,
					locale: NS
				}, SessionProgressBar));
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
