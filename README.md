# beadwork

Everything I use for working in [beads](https://github.com/steveyegge/beads) (`bd`) from Claude Code, in one plugin: a live pane, capture/triage skills, and a parent-epic hook.

## Install

```bash
/plugin marketplace add avegancafe/avegancafe-marketplace
/plugin install beadwork@avegancafe-marketplace
```

Then restart Claude Code. (The marketplace and plugin repos are private — installation uses your GitHub SSH access.)

## What's inside

### Pane — `/beadwork`

A right-hand pane (a Claude Code mod: `hooks/register.tsx`), opened with `/beadwork`, that always says what it knows:

- **Claude tasks** — Claude Code's own task list (the one ctrl+t shows), read via the `TaskList` tool after every `TaskCreate`/`TaskUpdate`. Explicit states: *none*, *N/M done*, or *unavailable here* (sessions without task tools, e.g. the desktop Code tab).
- **Beads** — open + in-progress beads, **grouped by tracker**: every `.beads` from the session's cwd up to `/`, nearest first (e.g. `~/workspace/<repo>` then `~/workspace`). Within a tracker, beads **nest under their epic**: loose beads first, then each epic as a magenta `▾` sub-heading with its open children indented beneath (an epic with nothing open under it says so — a nudge to close it). A bead whose parent is closed or lives in another tracker shows loose. In-progress first, then by priority, at every level. Refreshes every 10 s and right after any `bd` command Claude runs. Non-tracker `.beads` folders (like `~/.beads`) are skipped.

It's interactive — click, or focus the pane (ctrl+x tab) and use Tab/Enter:

- **Collapse/expand** any heading — *Claude tasks*, *Beads*, each tracker, each epic — via its `▾`/`▸`. Folds persist for the session and the freed rows go to what's still open.
- **Press a bead** to copy its id.
- **↻ refresh** (hotkey `r`) re-reads tasks and beads now.

Opens only when you run `/beadwork` — never on its own at session start. Until then it does no background work (no `bd list` polling); once open it stays refreshed, including across a plugin reload.

### Skills

Naming scheme: `beadwork:<gerund>-<object>` — the verb says what you're doing, the namespace says it's beads.

| Skill | Triggers on |
|-------|-------------|
| **beadwork:logging-captures** | Rapidly logging bugs/tasks/features/ideas into a `bd` tracker during a capture/triage session — spawns research subagents to author well-formed beads (type, parent epic, label, provenance, acceptance criteria, `file:line` refs). |
| **beadwork:writing-titles** | Creating/updating a `bd` issue — keeps titles tight (drops redundant prefixes, parentheticals, slash-lists, file paths). |

### Hook

`hooks/epic-parent-reminder.sh` — a `PostToolUse(Bash)` hook. After a `bd update` / `bd close` / `bd reopen`, it surfaces the affected issue's **parent epic** (id, status, child-completion) so you can decide whether the epic's status needs updating. Fail-safe: never blocks the tool; exits silently when `bd`/`jq` are missing or the command isn't a beads state change.

## Requirements

- `bd` on `PATH` (pane, skills, hook); `jq` for the hook. Everything degrades gracefully when absent.
- A Claude Code build with plugin hooks modules (mods) for the pane; the skills and hook work on any version.

## License

MIT
