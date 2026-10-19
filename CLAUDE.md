# CLAUDE.md — beadwork

Guidance for Claude Code when working **on this repository** (developing/maintaining the plugin), not when using it.

---

## ⚠️ CRITICAL — read before any change

1. **Bump the version on EVERY change to this repo.** Edit `version` in
   [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) (semver) and add a
   matching entry to [`CHANGELOG.md`](CHANGELOG.md). These two must always agree
   (CI checks). No "trivial" exception — docs-only changes bump the patch version too.
   **Don't touch the marketplace** — on merge to `main`,
   [`.github/workflows/release.yml`](.github/workflows/release.yml) sends a
   `plugin-released` dispatch and `avegancafe-marketplace` updates the `beadwork`
   entry, its own version, and its CHANGELOG by itself. That needs this repo's
   `MARKETPLACE_DISPATCH_TOKEN` secret (fine-grained PAT, `avegancafe-marketplace`
   only, Contents: read & write); a failed `release.yml` run means the marketplace
   was NOT updated.
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
.github/workflows/ci.yml          # validate, shellcheck, hook smoke test, version<->CHANGELOG
.github/workflows/release.yml     # On a version change on main: notify the marketplace (rule 1)
skills/logging-captures/          # Capture/triage logging workflow
skills/writing-titles/            # Tight bead-title guidance
hooks/hooks.json                  # modules: [register.tsx] + classic PostToolUse hook
hooks/register.tsx                # The pane (Claude tasks + open beads), /beadwork
hooks/epic-parent-reminder.sh     # The hook script (must stay executable)
types/index.d.ts                  # $.state contract for the pane
tests/open-on-start.test.ts       # `claude plugin test .`: openOnStart opens the pane
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
- Pane code: every helper that takes `$` must be a **top-level** function
  declaration — `claude plugin validate` refuses `$` passed to a nested closure.

## Testing changes locally

```bash
/plugin marketplace add /Users/kyle/workspace/avegancafe-marketplace
/plugin install beadwork@avegancafe-marketplace
# or: claude --plugin-dir .   (hot-reloads the pane in an interactive session)
# desktop app: ~/.claude/settings.json env has CLAUDE_CODE_PLUGIN_DIRS including
#   ~/workspace/beadwork plus CLAUDE_CODE_PLUGIN_DIR_WATCH=1 (hot reload), with
#   beadwork@avegancafe-marketplace disabled so it doesn't load twice.
# restart Claude Code; run a `bd` state change to verify the hook fires,
# and exercise the skills via their trigger phrasing.
```

## Provenance

Extracted from my `~/.claude/` (the Juliet dotfiles). These skills/hook were
moved here out of the dotfiles so they're installable as a plugin.
