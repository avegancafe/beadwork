# CLAUDE.md — beadwork

Guidance for Claude Code when working **on this repository** (developing/maintaining the plugin), not when using it.

---

## ⚠️ CRITICAL — read before any change

1. **Bump the version on EVERY change to this repo.** Edit `version` in
   [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) (semver), add a
   matching entry to [`CHANGELOG.md`](CHANGELOG.md), **and** update the
   `beadwork` entry's `version` in the marketplace repo
   (`avegancafe/avegancafe-marketplace` → `.claude-plugin/marketplace.json`).
   These three must always agree. No "trivial" exception — docs-only changes bump
   the patch version too.
2. **`hooks/hooks.json` is auto-loaded.** Do NOT also reference it from
   `plugin.json` (`manifest.hooks`) — that triggers a "Duplicate hooks file
   detected" error.
3. **`hooks/hooks.json` carries both kinds of hook.** `modules` names the pane's
   hooks module (`hooks/register.tsx`); `hooks` holds the classic `PostToolUse`
   shell hook. Keep both keys in the one file.
4. **The hook must stay fail-safe and executable.**
   `hooks/epic-parent-reminder.sh` must exit 0 silently for non-`bd` commands,
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

**beadwork** — my Claude Code plugin for working in beads (`bd`): a live pane
(mod), capture/triage skills, and a parent-epic hook. Distributed via the private
`avegancafe/avegancafe-marketplace` and installed with
`/plugin install beadwork@avegancafe-marketplace`. (Formerly the `avegancafe`
grab-bag plugin, whose contents were all beads tooling.)

## Layout

```
.claude-plugin/plugin.json        # Manifest (name, version, metadata, types). REQUIRED.
.claude/patterns/                 # Durable repo patterns (see ToC above)
skills/logging-captures/          # Capture/triage logging workflow
skills/writing-titles/            # Tight bead-title guidance
hooks/hooks.json                  # modules: [register.tsx] + classic PostToolUse hook
hooks/register.tsx                # The pane (Claude tasks + open beads), /beadwork
hooks/epic-parent-reminder.sh     # The hook script (must stay executable)
types/index.d.ts                  # $.state contract for the pane
README.md                         # User-facing docs
```

`.claude-plugin/` holds **only** manifests — never put skills/hooks inside it.
(`.claude-plugin/types/` is engine-generated typings for editors; gitignored.)

## Naming

Skills are `<gerund>-<object>` (`logging-captures`, `writing-titles`) and never
repeat "bead" — the `beadwork:` namespace already says it.

## Editing rules

- **Skill frontmatter `description:`** is the trigger contract — it's how the skill
  gets matched. Edit it deliberately; keep it specific about *when* to use the skill.
- After any change, follow the version-bump rule above.
- Check the pane with `claude plugin validate .` before committing.

## Testing changes locally

```bash
/plugin marketplace add /Users/kyle/workspace/avegancafe-marketplace
/plugin install beadwork@avegancafe-marketplace
# or: claude --plugin-dir .   (hot-reloads the pane in an interactive session)
# restart Claude Code; run a `bd` state change to verify the hook fires,
# and exercise the skills via their trigger phrasing.
```

## Provenance

Extracted from my `~/.claude/` (the Juliet dotfiles). These skills/hook were
moved here out of the dotfiles so they're installable as a plugin.
