# avegancafe

Kyle's personal Claude Code toolkit — [beads](https://github.com/steveyegge/beads) (`bd`) issue-tracking workflows and a concurrency-aware working posture.

## Install

```bash
/plugin marketplace add avegancafe/avegancafe-marketplace
/plugin install avegancafe@avegancafe-marketplace
```

Then restart Claude Code. (The marketplace and plugin repos are private — installation uses your GitHub SSH access.)

## What's inside

### Skills

| Skill | Triggers on |
|-------|-------------|
| **beads-capture-logging** | Rapidly logging bugs/tasks/features/ideas into a `bd` tracker during a capture/triage session — spawns research subagents to author well-formed beads (type, parent epic, label, provenance, acceptance criteria, `file:line` refs). |
| **writing-bead-titles** | Creating/updating a `bd` issue — keeps titles tight (drops redundant prefixes, parentheticals, slash-lists, file paths). |
| **dinner-rush** | Something changed that you didn't do (file edits, commits, moved tracker issues) or the user says other agent sessions are running — sets a cautious, change-tolerant posture instead of "fixing" peer changes. |

### Hook

`hooks/bd-epic-parent-reminder.sh` — a `PostToolUse(Bash)` hook. After a `bd update` / `bd close` / `bd reopen`, it surfaces the affected issue's **parent epic** (id, status, child-completion) so you can decide whether the epic's status needs updating. Fail-safe: never blocks the tool; exits silently when `bd`/`jq` are missing or the command isn't a beads state change.

## Requirements

- The skills and hook assume the `bd` (beads) CLI is on `PATH`. The hook also uses `jq`. Both degrade gracefully when absent.

## License

MIT
