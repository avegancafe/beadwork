# CLAUDE.md — avegancafe

Guidance for Claude Code when working **on this repository** (developing/maintaining the plugin), not when using it.

---

## ⚠️ CRITICAL — read before any change

1. **Bump the version on EVERY change to this repo.** Edit `version` in
   [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) (semver), add a
   matching entry to [`CHANGELOG.md`](CHANGELOG.md), **and** update the
   `avegancafe` entry's `version` in the marketplace repo
   (`avegancafe/avegancafe-marketplace` → `.claude-plugin/marketplace.json`).
   These three must always agree. No "trivial" exception — docs-only changes bump
   the patch version too.
2. **`hooks/hooks.json` is auto-loaded.** Do NOT also reference it from
   `plugin.json` (`manifest.hooks`) — that triggers a "Duplicate hooks file
   detected" error.
3. **The hook must stay fail-safe and executable.**
   `hooks/bd-epic-parent-reminder.sh` must exit 0 silently for non-`bd` commands,
   missing `bd`/`jq`, or repos without beads — it must never block the Bash tool.
   Keep it `chmod +x`. Paths use `${CLAUDE_PLUGIN_ROOT}`, never `$HOME/.claude/...`.

---

## 📚 Pattern library — `.claude/patterns/`

Accumulated, durable patterns for this repo live in
[`.claude/patterns/`](.claude/patterns/). **This section is their table of
contents — keep it in sync whenever a pattern file is added, renamed, or removed.**

| Pattern | What it covers |
|---------|----------------|
| _(none yet)_ | Add patterns via the `/learn` skill, or by hand into `.claude/patterns/<slug>.md`, then list them here. |

See [`.claude/patterns/README.md`](.claude/patterns/README.md) for the convention.

---

## What this repo is

My **grab-bag** Claude Code plugin — a portable catch-all for the personal
skills and hooks I carry across machines, with no single theme. Today that's
beads (`bd`) tooling plus a parent-epic-status hook, but anything personal that
lacks a more specific home (e.g. the `kitchen-brigade` plugin) belongs here.
Distributed via the private `avegancafe/avegancafe-marketplace` and installed with
`/plugin install avegancafe@avegancafe-marketplace`.

## Layout

```
.claude-plugin/plugin.json        # Manifest (name, version, metadata). REQUIRED.
.claude/patterns/                 # Durable repo patterns (see ToC above)
skills/beads-capture-logging/     # Capture/triage logging workflow
skills/writing-bead-titles/       # Tight bead-title guidance
hooks/hooks.json                  # Registers the PostToolUse hook (auto-loaded)
hooks/bd-epic-parent-reminder.sh  # The hook script (must stay executable)
README.md                         # User-facing docs
```

`.claude-plugin/` holds **only** manifests — never put skills/hooks inside it.

## Editing rules

- **Skill frontmatter `description:`** is the trigger contract — it's how the skill
  gets matched. Edit it deliberately; keep it specific about *when* to use the skill.
- After any change, follow the version-bump rule above.

## Testing changes locally

```bash
/plugin marketplace add /Users/kyle/workspace/avegancafe-marketplace
/plugin install avegancafe@avegancafe-marketplace
# restart Claude Code; run a `bd` state change to verify the hook fires,
# and exercise the skills via their trigger phrasing.
```

## Provenance

Extracted from my `~/.claude/` (the Juliet dotfiles). These skills/hook were
moved here out of the dotfiles so they're installable as a plugin.
