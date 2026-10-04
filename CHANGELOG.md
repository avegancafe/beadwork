# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.3] - 2026-10-04

### Fixed
- Pane: beads showed *no beads database found* when the session's cwd was a nested git repo (e.g. `~/workspace/<repo>` under `~/workspace/.beads`) — `bd` stops searching at the git root. The pane now walks up from the cwd to the nearest `.beads` and runs `bd` there; with none found it says *No .beads above this folder*.

## [2.0.2] - 2026-10-04

### Added
- CI (`.github/workflows/ci.yml`): `claude plugin validate`, shellcheck on the hook, a check that the hook stays silent for non-`bd` commands, and plugin.json ↔ CHANGELOG version sync.

## [2.0.1] - 2026-10-04

### Fixed
- Pane: a refresh triggered while a `TaskList` or `bd list` probe is in flight now queues one follow-up probe instead of being dropped, so the pane can't stick on a stale list.
- Pane: a `TaskList` call that returns an error now shows *unavailable here* rather than *none*.

## [2.0.0] - 2026-10-04

### Changed
- **Renamed the plugin `avegancafe` → `beadwork`** (repo `avegancafe/avegancafe-plugin` → `avegancafe/beadwork`). Everything in it was beads tooling, so it's now a dedicated beads plugin instead of a grab-bag. Reinstall as `beadwork@avegancafe-marketplace`.
- Skills renamed to one scheme, `<gerund>-<object>` under the `beadwork:` namespace: `beads-capture-logging` → `logging-captures`, `writing-bead-titles` → `writing-titles`. Hook script `bd-epic-parent-reminder.sh` → `epic-parent-reminder.sh`.

### Added
- **Beadwork pane** (`hooks/register.tsx`, `/beadwork`): a Claude Code mod showing Claude's task list (via `TaskList`, with explicit none/unavailable states) and open + in-progress beads (`bd list --json`, refreshed every 10 s and after `bd` commands).

## [1.0.4] - 2026-06-30

### Changed
- Switched repo documentation to first person ("my"/"I") throughout — README, CLAUDE.md, CONTRIBUTING.md, and the plugin description. Contents unchanged.

## [1.0.3] - 2026-06-30

### Changed
- Reframed the plugin as a portable **grab-bag** of personal tooling (a catch-all carried across machines) rather than a beads-specific toolkit. Updated description, README, CLAUDE.md, and keywords; contents unchanged.

## [1.0.2] - 2026-06-30

### Removed
- `dinner-rush` skill — moved to the `kitchen-brigade` plugin (it's a concurrency posture that fits the brigade's parallel-agent model). Drop the "concurrency-aware" framing from the plugin description/keywords.

## [1.0.1] - 2026-06-30

### Added
- Standard OSS community files: `CONTRIBUTING.md`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.
- `.claude/patterns/` pattern library with a table of contents maintained in `CLAUDE.md`.

### Changed
- `CLAUDE.md` rewritten to lead with critical rules (version bumping, hook fail-safety) and serve as the pattern-library ToC.

## [1.0.0] - 2026-06-30

### Added
- Initial release. Skills: `beads-capture-logging`, `writing-bead-titles`, `dinner-rush`.
- `PostToolUse(Bash)` hook `bd-epic-parent-reminder.sh` — surfaces a touched issue's parent epic after `bd update`/`close`/`reopen`.
