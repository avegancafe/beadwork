---
name: dinner-rush
description: Use when something changed unexpectedly that you did not do — a file holding edits you don't remember making, an unfamiliar commit/branch/stash, a test that newly exists or changed result, a tracker issue that moved, or working state that differs from your last snapshot ("file modified by user or linter", "changed from under you") — to weigh whether a concurrent session caused it before treating it as a bug. Also use when the user says other Claude/agent sessions are running at the same time in the same repo or workspace (that confirms concurrency). Sets a cautious, change-tolerant posture; attributes peer changes to the other sessions instead of reverting or "fixing" them.
---

# Dinner Rush

## Overview

It's the dinner rush: the kitchen is slammed with simultaneous orders and you're not the only one working the pass. Another session may be editing the same working tree, moving git state (new commits, branches, stashes), or writing a shared issue tracker (beads) **while you work**. Adopt this posture for the rest of the session: **the workspace is shared and mutable under you.** Unexpected ≠ broken.

**Core principle: when something looks changed or off, suspect a peer session before you suspect a bug — and never destructively "fix" it.**

## Two ways you got here

- **You noticed a surprise (you pulled this skill in yourself).** Something changed that you didn't do. Treat "a concurrent session did this" as the **leading hypothesis** — not yet certain. Verify current state, do **not** revert, and rebase your mental model before proceeding. If it materially affects your work, confirm with the user rather than guessing.
- **The user invoked this skill.** Multiple sessions are **confirmed** running right now. Don't treat concurrency as hypothetical — hold the full posture below for the rest of the session, and expect the tree, git state, and tracker to move under you repeatedly.

## Attribution heuristic

Before reacting to anything surprising — a file carrying edits you didn't make, a commit or branch you don't recognize, a test that newly exists or whose result changed, a tracker issue whose status moved — assume **a concurrent session likely did it**, then:

- **Don't revert, overwrite, or "restore" it.** It is probably intentional peer work, not corruption.
- **Re-read current state** (`git status`, `git log --oneline -8`, re-Read the file) instead of trusting your earlier snapshot.
- **If it blocks you or genuinely looks wrong, ask the user** — they are coordinating the sessions — rather than acting on it unilaterally.

## Operate carefully

- Prefer **narrow, lane-scoped, reversible** actions. Stage only the files you yourself changed.
- **Re-check `git status` / `git log` immediately before** any write-heavy or irreversible git operation — state may have moved since you last looked.
- **Re-Read a file right before editing** if any time has passed; edit against the current bytes, not a stale memory of them.
- Assume your own uncommitted work could collide with a peer's — commit your lane promptly so it's durable and attributable.

## Risky operations — avoid or narrow

| Don't | Do instead |
|---|---|
| `git add -A` / `git commit -am` | `git add <only your files>` |
| `git reset --hard`, `git checkout -- .`, `git clean` | Leave others' changes alone; stash only your own if needed |
| force-push, delete/rename branches, rebase a shared branch | Coordinate with the user first |
| Mass reformat / lint-fix across the tree | Limit to files you are actively editing |
| Delete "stray" or unrecognized files | Assume a peer created them; ask before removing |
| Bulk tracker writes (`bd` mass close/relabel/delete) | Touch only the issues you own this session |

## Red flags — stop and reconsider

- "This file changed from what I expected, I'll revert it" → **no — a peer changed it. Rebase your model.**
- "This commit/branch/stash looks like junk, I'll reset it away" → **no — verify with the user first.**
- "Files or tests I didn't create are here, something's broken" → **expected in shared work; don't treat it as breakage.**
- "A peer's change is half-finished or breaks the build, I'll revert it / finish it for them" → **no — it's likely mid-flight. Unblock additively (e.g. install a missing dep) or ask; don't revert, complete, or clobber their work.**
- About to run a tree-wide, destructive, or history-rewriting command → **re-check state and narrow the scope first.**

## First moves

Whichever way you got here: re-establish current state (`git status`, recent `git log`, and the relevant tracker view) before acting, and rebase your mental model onto what's actually on disk now. If the user invoked this, also fold in any specifics they gave (which repos, how many sessions, who owns what) and carry the posture for the remainder of the session.
