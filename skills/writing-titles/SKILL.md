---
name: writing-titles
description: Use when creating or updating a beads (bd) issue — running bd create, bd quick, bd update, or drafting/renaming an epic or task title. Especially when a title is getting long or carries parentheticals, slash-lists, "+"-joined clauses, file paths, or a redundant project/epic prefix.
---

# Writing bead titles

## Overview
A bead title is read in the **Obsidian Beads Board card UI** — a narrow card, small font, that wraps or truncates after a few words. The title's only job is to be **scannable at a glance**. Detail crammed into it makes the whole board harder to scan and gets cut off anyway. **The title is the one thing this issue is; every other fact lives in the description and acceptance criteria.**

## The contract — what a good title is
- **Short:** a noun- or verb-phrase, **≤ ~6 words / ~50 characters**.
- **Front-loaded:** the distinctive words come first — cards truncate, so the gist must land in the first ~30 characters.
- **One thing:** the *what*, at the altitude of the issue's essence. Not the why, where, how, or a breakdown of scope.
- **No detail packaging:** no parentheticals, no `a / b / c` lists, no `+` or "and also" clauses, no file paths or `file.ts:line` references.
- **No redundant context:** drop anything the board already groups by — the epic name, the label/area, the project (`Beads Board:`), the issue type.

## Recipe — each time you write or edit a title
1. Write the bare *what* in a few words.
2. Delete context the board already shows (epic / label / project prefix).
3. See a `(…)`, a `/`-list, or a `+`? That is **detail** — cut it from the title and make sure it lands in the **description** (the full what / why / scope) and **acceptance criteria** (the checklist).
4. Trim until it reads in the first few words and fits ~50 characters.

## Before → after (real over-long titles from this tracker)
| Too long — detail jammed into the title | Concise title | Where the detail goes |
|---|---|---|
| `Beads Board: larger task-title font in board cards + detail view` | `Bigger task-title font` | description |
| `Fill in Pets real facts (Leo/Sierra: breed/birthdate/vet/microchip/weight)` | `Fill in Leo & Sierra profiles` | acceptance checklist |
| `Confirm Supplies brands/sources/cadences + set last_bought (laundry/dish soap)` | `Confirm supply brands & cadences` | description + acceptance |
| `Install Periodic Notes plugin + verify daily-note one-tap (desktop/mobile)` | `Install Periodic Notes plugin` | acceptance criteria |

## Common mistakes
- **Parenthetical scope dump** — `(a, b, c, d)` trailing the title → move the list to acceptance criteria.
- **`+` / "and" joining two tasks** → split into two beads, or keep the title to the primary action.
- **Redundant prefix** — `Beads Board:` / `ep5:` on every title; the board already groups by epic and label.
- **Paths in the title** — `src/render.ts:803` belongs in the description, never the title.
