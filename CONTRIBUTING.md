# Contributing to avegancafe

This is my personal Claude Code plugin (beads workflows + a parent-epic hook),
distributed through the `avegancafe/avegancafe-marketplace`.

## Golden rule: bump the version

**Every change bumps the version** — including docs. Update, together, in one PR:

1. `version` in [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) (semver)
2. A new entry in [`CHANGELOG.md`](CHANGELOG.md)
3. The `avegancafe` entry's `version` in the marketplace repo
   (`avegancafe/avegancafe-marketplace` → `.claude-plugin/marketplace.json`)

These three values must always match.

## Local development

```bash
git clone git@github.com:avegancafe/avegancafe-plugin.git
/plugin marketplace add /path/to/avegancafe-marketplace
/plugin install avegancafe@avegancafe-marketplace
# restart Claude Code; trigger a `bd` state change to verify the hook fires.
```

## Component rules

- **Manifests only** live in `.claude-plugin/`; skills/hooks live at the repo root.
- **`hooks/hooks.json` is auto-loaded** — never also reference it from `plugin.json`.
- **The hook is fail-safe and executable.** It must exit 0 silently when `bd`/`jq`
  are missing or the command isn't a beads state change; keep it `chmod +x`.
- **Paths use `${CLAUDE_PLUGIN_ROOT}`**, never `$HOME/.claude/...`.
- Skill `description:` frontmatter is the trigger contract — keep it specific.

## Pull requests

- Keep changes focused; one logical change per PR.
- Validate JSON: `python3 -m json.tool .claude-plugin/plugin.json hooks/hooks.json`.
- Shell-check the hook if you touch it.

See [`CLAUDE.md`](CLAUDE.md) for the full maintainer guide and the pattern-library table of contents.
