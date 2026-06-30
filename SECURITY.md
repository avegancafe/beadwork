# Security Policy

## Supported Versions

The latest released version is supported. See [`CHANGELOG.md`](CHANGELOG.md) for releases.

## Reporting a Vulnerability

This plugin runs as part of Claude Code and registers a **`PostToolUse` hook that
executes a shell script after Bash commands**. If you discover a security issue —
for example a way the hook could be coerced into running unintended code — please
report it privately:

- Open a [GitHub security advisory](https://github.com/avegancafe/avegancafe-plugin/security/advisories/new), or
- Contact the maintainer directly rather than filing a public issue.

Please do not disclose the issue publicly until it has been addressed.

## Scope notes

- `hooks/bd-epic-parent-reminder.sh` parses the Bash command from hook JSON and
  shells out to `bd`/`jq`. Report any input handling that could lead to command
  injection or reading data outside the intended beads scope.
- The hook is designed to be fail-safe (exit 0, never block). A change that lets it
  block the Bash tool or run on unintended commands is a defect worth reporting.
