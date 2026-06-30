# CLAUDE.md — avegancafe plugin

Guidance for Claude Code when working **on this repository** (developing/maintaining the plugin), not when using it.

## What this repo is

Kyle's personal Claude Code **plugin**: beads (`bd`) issue-tracking skills plus a parent-epic-status hook. Distributed via the private `avegancafe/avegancafe-marketplace` and installed with `/plugin install avegancafe@avegancafe-marketplace`.

## Layout

```
.claude-plugin/plugin.json        # Manifest (name, version, metadata). REQUIRED.
skills/beads-capture-logging/     # Capture/triage logging workflow
skills/writing-bead-titles/       # Tight bead-title guidance
skills/dinner-rush/               # Concurrency-aware posture
hooks/hooks.json                  # Registers the PostToolUse hook (auto-loaded)
hooks/bd-epic-parent-reminder.sh  # The hook script (must stay executable)
README.md                         # User-facing docs
```

`.claude-plugin/` holds **only** manifests — never put skills/hooks inside it.

## Rules when editing

- **`hooks/hooks.json` is auto-loaded** by Claude Code. Do NOT also reference it from `plugin.json` (`manifest.hooks`) — that triggers a "Duplicate hooks file detected" error.
- **Hook paths use `${CLAUDE_PLUGIN_ROOT}`** (e.g. `"${CLAUDE_PLUGIN_ROOT}/hooks/bd-epic-parent-reminder.sh"`), never `$HOME/.claude/...`.
- **Keep the hook script executable** (`chmod +x hooks/bd-epic-parent-reminder.sh`) and **fail-safe**: it must exit 0 silently for non-`bd` commands, missing `bd`/`jq`, or repos without beads. Never let it block the Bash tool.
- **Skill frontmatter `description:`** is the trigger contract — it's how the skill gets matched. Edit it deliberately; keep it specific about *when* to use the skill.
- **Bump `version` in `.claude-plugin/plugin.json`** on meaningful changes and update the matching `version` for `avegancafe` in the marketplace repo's `marketplace.json`. Use semver.

## Testing changes locally

```bash
/plugin marketplace add /Users/kyle/workspace/avegancafe-marketplace
/plugin install avegancafe@avegancafe-marketplace
# restart Claude Code; run a `bd` state change to verify the hook fires,
# and exercise the skills via their trigger phrasing.
```

## Provenance

Extracted from Kyle's `~/.claude/` (the Juliet dotfiles). These skills/hook were moved here out of the dotfiles so they're installable as a plugin.
