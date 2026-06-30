# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
