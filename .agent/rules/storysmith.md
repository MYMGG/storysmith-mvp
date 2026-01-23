# StorySmith — Antigravity Workspace Rules (v1.1)

## 0) Operating posture
- Be technical, concise, objective. No greetings, no apologies, no meta.
- Prefer small, reversible changes. Minimize token/context usage.
- If ambiguous: present 2 interpretations and ask before making changes.

## 1) Scope boundaries (hard)
- Only read/write inside the current workspace (repo root).
- Allowed extra folders inside repo: /session_log and /.agent
- Never modify files outside the repo root. (No home-dir writes, no system config.)

## 2) Secrets & safety (hard)
- Never print, paste, or log secrets (API keys, tokens, cookies).
- Never hardcode secrets. Use existing env patterns. If missing, request user guidance.
- Never modify `.env*` unless explicitly instructed by the user.

## 3) Terminal command discipline (hard)

### 3.0 Preflight for every command
Before ANY command, show:
- Command
- Why it’s needed
- Expected effect
- Rollback path

Exception (read-only allowlist commands):
- You may shorten this to a single line: "Read-only: <command> (reason)".

### 3.1 Auto-exec denylist (hard)
- Even when Terminal is set to Auto, DO NOT auto-run any command matching these patterns:
  - rm -rf, del /s, rmdir /s, Remove-Item -Recurse -Force, format, diskpart, bcdedit, reg add/delete, sc.exe, netsh, Set-MpPreference
  - package manager global installs (npm -g, pnpm add -g, yarn global)
  - any command that writes outside the repo root
- If such a command is required, ASK_USER with:
  - exact command
  - exact file/path targets
  - rollback plan

### 3.2 Secure Mode posture (recommended)
- Secure Mode is a “high-risk toggle”.
- Normal development posture:
  - Secure Mode: OFF
  - Terminal policy: Auto
  - Deny list: populated (see /.agent/terminal_denylist_suggested.txt)
- When doing risky work (unknown scripts, new packages, suspicious diffs):
  - Secure Mode: ON
  - Expect terminal commands to require review more often.

### 3.3 One-command-per-run (hard)
- Never chain terminal commands in a single run. Do NOT use `;`, `&&`, `||`, or pipes `|`.
- If multiple commands are needed, propose them as separate terminal runs (ONE command per run).
- Do not use `echo` separators; keep each run focused on a single diagnostic output.
- Canonical repo-root check is: `git rev-parse --show-toplevel` (never use mistyped variants like `--show-tget-root`).
- Prefer simplest read-only diagnostics (e.g., `git status` or `git status --short`) without wrapper shells.

### 3.4 Transcript Mode (copy/paste-friendly reporting) (hard when enabled)
Trigger:
- If the user says `TRANSCRIPT_MODE: ON` (or asks for “copy/paste report”, “shareable report”, “raw transcript”), enable Transcript Mode for the remainder of the current task.

Behavior (when enabled):
- Create or overwrite a RAW TRANSCRIPT markdown file under:
  - `.agent/session_log/<TASK_ID>-RAW-TRANSCRIPT.md`
- After EVERY terminal run_command, append:
  - Timestamp (local)
  - Exact command string (single line)
  - Full stdout (fenced code block)
  - Full stderr if any (fenced code block)
  - Exit code if available
- After EVERY code analysis excerpt, append:
  - File path + line ranges
  - Key snippets (fenced code blocks)
  - 1–2 sentences explaining relevance
- One command per run (no `;`, `&&`, `||`, `|`). No `echo` separators.
- End each evidence pass with:
  - `## ===BEGIN_PASTE===` and `## ===END_PASTE===`
  - A single consolidated summary + evidence bullets + next step

Completion message (when enabled):
- Reply ONLY with:
  - `RAW TRANSCRIPT UPDATED: <path>`
  - `LAST APPEND ENDS AT: <section heading>`

### 3.5 Low-friction safe approvals (recommended)
Goal: reduce repetitive “approve this command?” prompts for common read-only diagnostics.
- If the tool/terminal offers an “Always proceed / don’t ask again” option, you may use it ONLY for allowlisted read-only commands below.
- Do NOT use “Always proceed” for anything outside this list.

Allowlist (read-only):
- git status
- git status --short
- git diff --stat
- git diff --name-only
- git branch --show-current
- git rev-parse --show-toplevel
- git check-ignore -v <path>

Rule:
- If asked to run a chained command (e.g., with `;`, `&&`, `||`, `|`), reject and request a single allowlisted command instead.

## 4) Git discipline (hard)
- Never commit unless asked.
- Before edits: ensure changes are on a non-main branch OR document how to revert.
- After edits: produce a “Diff Summary”:
  - Files changed
  - What changed (1–2 bullets per file)
  - One verification command + success criteria

## 5) Session log (required)
- At session start: create `/session_log` if missing.
- Create a log file named: `YYYY-MM-DD_YYYY_SESSION01.md` (increment SESSION## if needed).
- Maintain continuously: record
  - Goals
  - Commands executed (with short outcomes)
  - Files changed
  - Hypotheses + conclusions
  - Bugs found
  - Next steps
- End-of-session: add a “Handoff Summary” with current state + what the next agent should do.

Note:
- `/session_log/` is the durable human-facing log.
- `.agent/session_log/` is allowed for Transcript Mode raw dumps (often noisy and may be gitignored).

## 6) Quality gates
- If a command fails: analyze and attempt ONE fix; if still failing, ask user with the exact error snippet and proposed next action.
- For UI changes: include a quick visual verification step (e.g., run dev server + check target route).
- Avoid console.log in production paths; prefer structured logging if a logger exists.

## 7) Output format for work
Use this order:
1) TL;DR
2) Plan
3) Actions taken
4) Diff Summary
5) Verification command + success criteria
6) Session log update note (what was appended)

Always end with a copy/paste-friendly “Paste-back block” (even when Transcript Mode is OFF):
- Provide a short block the user can relay containing:
  - Status
  - Outputs (key filenames/paths)
  - NEEDED_FROM_USER
  - NextStep

## 8) StorySmith workflow pack (required)

### 8.1 Diagnose → Patch → Verify loop (always)
1) Diagnose:
   - Reproduce once.
   - Capture the exact error snippet and file:line if present.
   - Identify the smallest likely root cause.
2) Patch:
   - Prefer minimal change set.
   - Avoid broad refactors unless requested.
   - Never change unrelated formatting.
3) Verify:
   - Run ONE command that proves the fix.
   - State success criteria.
   - If not fixed, roll back or propose next minimal patch.

### 8.2 Definition of done (must state explicitly)
A task is “done” only when:
- Build/test command passes (or the specific failure is explained and accepted by user).
- Diff Summary is produced (files changed + what changed).
- Session log updated (what was done + next step).

### 8.3 StorySmith quick checks (pick the smallest that fits)
- Repo hygiene:
  - git status
  - git diff --name-only
- Next/Node sanity:
  - node -v
  - npm -v
- Dev server smoke:
  - npm run dev
- Build smoke (when relevant):
  - npm run build

### 8.4 Act 3 focus (HTML/PDF)
When working on Act 3 rendering/export:
- Prefer isolating output-format bugs to a single component/module.
- Add a minimal sample input fixture when missing (user-approved).
- Never “invent” storage locations; locate them via repo search or runtime logs first.

END CONTENT.
