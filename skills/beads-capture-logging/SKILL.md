---
name: beads-capture-logging
description: >-
  Use when rapidly logging bugs, tasks, features, or ideas into a beads (bd) issue
  tracker during a capture/triage session — ESPECIALLY when the implementation lives
  in a separate repo or a concurrent session is editing the code. For each incoming
  item, spawn a Sonnet subagent to research the code READ-ONLY and author the bead
  (correct type, parent epic, label, discovered-from provenance, acceptance criteria,
  and file:line references), have it signal back when the bead is ready, then the main
  thread verifies and commits/pushes the .beads export with concurrency awareness.
  Trigger whenever the user says they're "logging tasks/bugs", sends a "task report"
  or "task submission", says "log a bug/task to…", or asks to file/capture a batch of
  work into beads — even if they don't name this workflow. Keep using it for every
  item across the session once it's active.
---

# Beads capture logging

## What this is for

A capture session is when the user is acting as a **product owner dictating work** — sending
one bug/task/idea after another to be filed into a beads tracker — while the actual
implementation happens elsewhere (a separate plugin/app repo, or a concurrent agent session
shipping the code). The user wants each item turned into a well-formed, deduped, actionable
bead, committed promptly, without derailing into implementing it.

This skill splits the labor so the main thread stays light and authoritative:

- **A Sonnet subagent researches + authors each bead** — it reads the target codebase
  read-only to ground the issue in real `file:line` references, then runs `bd create`.
- **The main thread owns git** — it verifies the bead, refreshes the export, and commits +
  pushes, with awareness that other writers may be moving the tree under it.

Why this division: research (reading lots of code) is context-heavy and parallelizable, so it
belongs in a throwaway subagent context. Git is a single serialization point and must stay in
one writer's hands to avoid clobbering — so the main thread keeps it.

## The loop (per incoming item)

For every task report the user sends:

1. **Decide how many beads.** One submission can be **multiple beads** if it bundles
   genuinely distinct logical chunks of work — fan out one researcher per chunk (spawn them in
   the same turn so they run concurrently). A cohesive multi-part ask (one feature, several
   facets) stays as **one** bead with multiple acceptance items. Use judgment on the seam.

2. **Spawn a Sonnet researcher** (Agent tool, `general-purpose`, `model: sonnet`) per bead.
   See the prompt skeleton below. It researches read-only, files the bead, and reports back the
   new issue id + a short findings summary — that's its "ready to commit" signal.

3. **Main thread commits + pushes** once the subagent reports back. Verify the bead landed,
   refresh the export, stage only the export, commit with a focused message, push. See the git
   flow below.

Run several researchers in parallel across items if the user sends them in a burst — but commit
**serially** in the main thread, one focused commit per bead, re-checking `git log` before each.

## The researcher subagent prompt (skeleton)

Adapt the bracketed parts. Keep the guardrails verbatim — they're what keep the subagent from
fighting the main thread or a concurrent implementer.

```
You are filing ONE beads issue for [PROJECT]. Research the code (READ-ONLY), then create the
bead. Do NOT commit, push, export, or edit any OTHER issue — the main thread handles git.
Multiple sessions are concurrently active; only create YOUR new issue and touch nothing else.

## Repos
- Code (RESEARCH ONLY — never edit): [path]. A concurrent session may be actively editing it.
- Beads tracker (run `bd create` here): [path].

## The task to file
[the user's ask, verbatim + any clarifying detail]

## Research first (read-only)
[point it at the likely files/symbols; ask it to capture concrete file:line refs + current
values so the implementer can act cold]

## Filing conventions (run bd from the tracker repo)
bd create "[concise title]" \
  --type [bug|task|feature|chore|epic] -p [0-3] \
  --deps parent-child:[epic-id] \
  --deps discovered-from:[originating-id] \
  --label [area-label] \
  --description "[full description INLINE — include the file:line refs found, implementation
                 notes, and any caveats/open questions]" \
  --acceptance "## Acceptance Criteria
- [verifiable criteria, incl. 'build + tests stay green']"

## Report back
Return ONLY: the new issue id, its title, and a 2-3 sentence summary of the key file:line
findings. The main thread will commit/push.
```

Hard rules to include every time:
- **Read-only on code.** The implementation repo is likely a peer's active lane — never edit it.
- **Put the description INLINE on `bd create`.** Do NOT follow up with `bd update --description`
  — a botched extract can blank the field. Get it right on create.
- **Touch only the new issue.** No commits, pushes, exports, or edits to other beads.

## Bead quality bar (what the subagent must satisfy)

Every bead should answer "what was this created for?" on its own:

- **Type + priority** — `bug` / `task` / `feature` / `chore` / `epic`; priority 0 (urgent) – 3 (low).
- **A home** — attach to the relevant epic via `--deps parent-child:<epic>`. If the work opens a
  genuinely new area with no fitting epic, create a small epic for it (epics need a
  `## Success Criteria` section). Don't manufacture an epic for a true one-off.
- **Provenance** — `--deps discovered-from:<id>` linking whatever surfaced it.
- **A label** — group by epic/area so the `bv` flow view works. Gotcha: `bd label add <id...>
  <label>` takes the **label last**.
- **`## Acceptance Criteria`** — required for lint (`bd lint -s all`); epics use `## Success
  Criteria`. Pass via `--acceptance`.
- **`file:line` grounding** — the description should cite concrete locations + current values so
  the implementer (often a different session) can act without re-discovering everything.

## Dedup and re-reports (check before filing)

- **Dedup first.** Search existing open AND closed issues for the same ask before creating. The
  subagent (or the main thread) should check — filing a duplicate fragments the history.
- **Re-report of a closed issue → reopen, don't duplicate.** If the user says an
  already-shipped/closed item "is still broken" or "wasn't addressed", reopen the original
  (`bd update <id> --status open`) and attach the new evidence as a `bd comment`, rather than
  creating a near-identical bead. Reopening preserves the attempted-fix context.
- **Re-investigate before assuming.** When a shipped fix is re-reported broken, have a subagent
  read the *current* code to find the real gap — and consider a stale installed/built artifact
  (e.g. a plugin that needs a rebuild + reload) as a leading hypothesis when the source looks
  correct.

## Main-thread git flow (concurrency-aware)

The tracker's `.beads/issues.jsonl` is a shared export that other sessions may also be writing.
Treat the tree as mutable under you:

```bash
# 1. Re-check state — HEAD may have moved since your last commit
git log --oneline -2

# 2. Refresh the export and stage ONLY it (skip .obsidian/ UI noise and
#    .beads/interactions.jsonl, which are peer/auto-managed)
bd export -o .beads/issues.jsonl
git add .beads/issues.jsonl

# 3. Focused commit referencing the issue id
git commit -m "beads: file <id> (<short title>) under <epic>"

# 4. Push; rebase over peer commits if rejected
git push || { git pull --rebase --autostash && git push; }
```

- **Stage only the beads export** — never `git add -A` in a shared tree.
- **A peer commit landing between your pushes is normal**, not breakage — rebase on top.
- **Commit live, one bead per commit** — don't batch. The user's history view correlates commits
  with issue state over time.
- Honor a standing "commit + push after each item" instruction if the user gave one; otherwise
  follow the repo's git policy.

## Reporting back to the user

After each commit, give the user a tight recap: the new (or reopened) issue id, its one-line
title, and the 1-2 highest-value findings from the research (e.g. the `file:line` + the root
cause or the non-obvious gotcha the subagent surfaced). Keep momentum — they're feeding you a
queue, so don't over-explain; surface what matters and signal you're ready for the next.
