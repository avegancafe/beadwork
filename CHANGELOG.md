# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.6] - 2026-10-04

### Fixed
- Parent-epic hook never fired for multi-segment ids like `ws-fwr-f14`: the id regex matched only the first two segments (`ws-fwr`, the epic itself), which has no parent. It now matches any number of `-segment`s.

## [2.0.5] - 2026-10-04

### Changed
- Docs: CLAUDE.md layout lists the CI and release workflows, and notes that pane helpers taking `$` must be top-level (the validator refuses closures).

## [2.0.4] - 2026-10-04

### Added
- `.github/workflows/release.yml`: on a version change on `main`, sends `plugin-released` to `avegancafe-marketplace`, which updates the `beadwork` entry itself. Needs the `MARKETPLACE_DISPATCH_TOKEN` secret.

### Fixed
- Pane: beads went blank (*No beads tracker above this folder*) after a shell `cd` moved the session's cwd outside the project (e.g. into `~/.config/...`). The `.beads` walk now also starts from the session's project root, which a shell `cd` doesn't move; results are deduped, cwd's trackers first.

## [2.0.3] - 2026-10-04

### Added
- Pane: **beads grouped by tracker.** The pane walks up from the session's cwd, collects every `.beads` on the way, and shows one group per tracker (nearest first, labelled by folder, e.g. `~/workspace/<repo>` above `~/workspace`), each with its own active/open counts and an even share of the rows. `bd` runs per tracker with `BEADS_DIR` pinned and `--readonly`, so an exported `BEADS_DIR` can't merge them.

### Fixed
- Pane: beads showed *no beads database found* when the session's cwd was a nested git repo (e.g. `~/workspace/<repo>` under `~/workspace/.beads`) — `bd` stops searching at the git root. Covered by the walk above.
- `.beads` folders that aren't trackers (e.g. `~/.beads`, bd's machine-wide state) are skipped instead of shown as errors.

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
