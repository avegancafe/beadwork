#!/usr/bin/env bash
# PostToolUse(Bash) hook: after a `bd update` / `bd close` / `bd reopen`, surface
# the affected issue's PARENT EPIC (id + status + child completion) so the agent
# can decide whether the epic's status needs updating.
#
# Fail-safe: never blocks the tool. Exits 0 silently for non-bd commands, in repos
# without beads, or if jq/bd are missing.
set -uo pipefail

command -v bd >/dev/null 2>&1 || exit 0
command -v jq >/dev/null 2>&1 || exit 0

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null)

# Only act on state-changing bd verbs.
printf '%s' "$cmd" | grep -Eq 'bd[[:space:]]+(update|close|reopen)' || exit 0

# Candidate issue ids referenced in the command (e.g. home-6z4, home-ep1.2, ws-fwr-f14).
ids=$(printf '%s' "$cmd" | grep -oE '[a-z][a-z0-9]*(-[a-z0-9]+)+(\.[0-9]+)?' | sort -u)
[ -z "$ids" ] && exit 0

seen=""
notes=""
for id in $ids; do
  parent=$(bd show "$id" --json 2>/dev/null | jq -r 'if type=="array" then .[0] else . end | .parent // empty' 2>/dev/null)
  [ -z "$parent" ] && continue
  case " $seen " in *" $parent "*) continue ;; esac
  seen="$seen $parent"
  pstatus=$(bd show "$parent" --json 2>/dev/null | jq -r 'if type=="array" then .[0] else . end | .status // "?"' 2>/dev/null)
  comp=$(bd show "$parent" 2>/dev/null | grep -oE '[0-9]+/[0-9]+ complete \([0-9]+%\)' | head -1)
  notes="${notes}\n- parent epic ${parent} [status: ${pstatus:-?}] ${comp}"
done
[ -z "$notes" ] && exit 0

msg=$(printf 'A bd state change touched a child issue — check whether its parent epic needs a status update:%b\nRule of thumb: all children closed -> close the epic; a child reopened while the epic is closed -> reopen the epic.' "$notes")
jq -cn --arg m "$msg" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$m}}'
exit 0
