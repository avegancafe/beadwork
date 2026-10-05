import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Bead, BeadGroup, BeadState, Task, TaskState, TaskStatus } from '../types'

const PANE = 'beadwork'
const BEADS_EVERY_MS = 10_000
const TASK_TOOLS = ['TaskCreate', 'TaskUpdate', 'TodoWrite']

const tasks = atom({ plugin: 'beadwork', key: 'tasks' } as const, { available: null, list: [] } as TaskState)
const beads = atom({ plugin: 'beadwork', key: 'beads' } as const, { groups: [] } as BeadState)

const MARK: Record<TaskStatus, string> = { pending: '☐', in_progress: '◐', completed: '☒' }
const asStatus = (s: unknown): TaskStatus => (s === 'in_progress' || s === 'completed' ? s : 'pending')

// TaskList's result shape isn't in this build's types: take a structured
// `tasks` array if there is one, else parse the text the model reads.
const parseTaskList = (result: any, text: string): Task[] => {
  const raw = Array.isArray(result?.tasks) ? result.tasks : Array.isArray(result) ? result : null
  if (raw) {
    return raw.map((t: any) => ({
      id: String(t.id),
      subject: String(t.subject ?? t.content ?? ''),
      status: asStatus(t.status),
      activeForm: t.activeForm,
    }))
  }
  // e.g. "#1 [in_progress] Fix the thing"
  return text
    .split('\n')
    .map(line => /#?(\d+)\D*?\[?(pending|in_progress|completed)\]?\s*[:\-]?\s*(.+)/.exec(line))
    .filter((m): m is RegExpExecArray => m !== null)
    .map(m => ({ id: m[1], status: asStatus(m[2]), subject: m[3].trim() }))
}

// Single-flight with one trailing rerun: a trigger that lands while a probe is
// in flight queues exactly one more probe, so the last change always shows.
let tasksRunning = false
let tasksAgain = false

// The pane opens only on `/beadwork`, so nothing probes until it's up. Ask the
// engine, not a module flag: a hot reload keeps the pane but resets the module.
async function paneIsOpen($: any): Promise<boolean> {
  return (await $.ui.panes()).some((p: any) => p.id === PANE)
}

async function refreshTasksIfOpen($: any): Promise<void> {
  if (await paneIsOpen($)) await refreshTasks($)
}

async function refreshBeadsIfOpen($: any): Promise<void> {
  if (await paneIsOpen($)) await refreshBeads($)
}

async function refreshTasks($: any): Promise<void> {
  if (tasksRunning) {
    tasksAgain = true
    return
  }
  tasksRunning = true
  try {
    do {
      tasksAgain = false
      await probeTasks($)
    } while (tasksAgain)
  } finally {
    tasksRunning = false
  }
}

async function probeTasks($: any): Promise<void> {
  try {
    const ran = await $.tool.call({ tool: 'TaskList' })
    const isOk = ran.deny === undefined && !ran.isError
    const list = isOk ? parseTaskList(ran.result, ran.text ?? '') : []
    $.ui.log(`TaskList → ${list.length} tasks; raw: ${JSON.stringify(ran.result ?? ran.text ?? ran.deny).slice(0, 400)}`, { to: 'debug' })
    await update($, tasks, () => ({ available: isOk, list }))
  } catch (err) {
    // Rejects when this session has no TaskList tool (e.g. the desktop Code tab).
    $.ui.log(`TaskList unavailable: ${String(err)}`, { to: 'debug' })
    await update($, tasks, () => ({ available: false, list: [] }))
  }
}

let beadsRunning = false
let beadsAgain = false

async function refreshBeads($: any): Promise<void> {
  if (beadsRunning) {
    beadsAgain = true
    return
  }
  beadsRunning = true
  try {
    do {
      beadsAgain = false
      await probeBeads($)
    } while (beadsAgain)
  } finally {
    beadsRunning = false
  }
}

// Every folder holding a `.beads`, walking up from the session's cwd and then
// from its project root (deduped, nearest first). We walk ourselves because bd
// stops at the nearest git root, so a session inside ~/workspace/<repo> would
// never see ~/workspace/.beads. The root matters because a shell `cd` moves the
// cwd (e.g. into ~/.config/...) but not the project root.
async function findBeadsRoots($: any): Promise<string[]> {
  const roots: string[] = []
  for (const start of [await $.session.cwd(), await $.session.root()]) {
    let dir = String(start).replace(/\/+$/, '') || '/'
    for (;;) {
      if (!roots.includes(dir) && (await $.fs.exists(beadsDir(dir)))) roots.push(dir)
      if (dir === '/') break
      const cut = dir.lastIndexOf('/')
      dir = cut <= 0 ? '/' : dir.slice(0, cut)
    }
  }
  return roots
}

const beadsDir = (root: string) => (root === '/' ? '/.beads' : `${root}/.beads`)

// bd's "this isn't a tracker" answers: ~/.beads is bd's machine-wide state dir,
// not a workspace, and must not show up as an error group.
const NOT_A_TRACKER = /no (active )?beads (workspace|database)/i

const homeLabel = (root: string) => root.replace(/^\/(Users|home)\/[^/]+/, '~') || '/'

async function listTracker($: any, root: string): Promise<BeadGroup | undefined> {
  const label = homeLabel(root)
  try {
    // BEADS_DIR pins bd to this tracker even if the shell exports another one.
    const { exitCode, stdout, stderr } = await $.process.run(
      ['bd', 'list', '--readonly', '--status=open,in_progress', '--json'],
      { cwd: root, env: { BEADS_DIR: beadsDir(root) }, timeoutMs: 15_000 },
    )
    if (exitCode !== 0) {
      const said = `${stderr}\n${stdout}`
      if (NOT_A_TRACKER.test(said)) return undefined
      const lines = said.split('\n').filter(l => l.trim())
      const why = lines.find(l => /error/i.test(l)) ?? lines[0] ?? `bd exited ${exitCode}`
      return { root, label, items: [], error: why }
    }
    const items: Bead[] = (JSON.parse(stdout || '[]') as any[]).map(b => ({
      id: String(b.id),
      title: String(b.title ?? ''),
      status: String(b.status ?? 'open'),
      priority: Number(b.priority ?? 4),
      type: String(b.issue_type ?? 'task'),
      parent: b.parent ? String(b.parent) : undefined,
    }))
    return { root, label, items }
  } catch (err) {
    return { root, label, items: [], error: `bd unavailable: ${String(err).slice(0, 80)}` }
  }
}

async function probeBeads($: any): Promise<void> {
  const roots = await findBeadsRoots($)
  const found = await Promise.all(roots.map(root => listTracker($, root)))
  const groups = found.filter((g): g is BeadGroup => g !== undefined)
  $.ui.log(`beads: ${roots.length} .beads found, ${groups.length} trackers: ${groups.map(g => `${g.label}=${g.error ? 'ERR' : g.items.length}`).join(', ')}`, { to: 'debug' })
  await update($, beads, () => ({
    groups,
    error: groups.length === 0 ? 'No beads tracker above this folder' : undefined,
    refreshedAt: Date.now(),
  }))
}

const byActive = (x: Bead, y: Bead) =>
  Number(y.status === 'in_progress') - Number(x.status === 'in_progress') || x.priority - y.priority

/** One drawn line of a tracker: a bead, how deep it sits, and — for an epic or
 * any bead with open children — how many of those it heads. */
type Row = { bead: Bead; depth: number; heads?: number }

// Nest each tracker's beads under their parent: loose beads first, then each
// epic (or other parent) as a sub-heading with its open children beneath. A
// bead whose parent isn't open here (closed, or in another tracker) is loose.
function layoutTracker(items: Bead[]): Row[] {
  const ids = new Set(items.map(x => x.id))
  const kids = new Map<string, Bead[]>()
  for (const x of items) {
    if (x.parent && ids.has(x.parent)) kids.set(x.parent, [...(kids.get(x.parent) ?? []), x])
  }
  const isHead = (x: Bead) => x.type === 'epic' || kids.has(x.id)
  const rows: Row[] = []
  const place = (x: Bead, depth: number) => {
    const under = [...(kids.get(x.id) ?? [])].sort(byActive)
    rows.push(isHead(x) ? { bead: x, depth, heads: under.length } : { bead: x, depth })
    for (const k of under) place(k, depth + 1)
  }
  const top = items.filter(x => !(x.parent && ids.has(x.parent))).sort(byActive)
  for (const x of top.filter(x => !isHead(x))) place(x, 0)
  for (const x of top.filter(isHead)) place(x, 0)
  return rows
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await $.command.register({ name: 'beadwork', description: 'Open the beadwork pane: Claude tasks + open beads' })
    // No auto-open. A pane left up across a reload/resume still gets refreshed.
    void refreshTasksIfOpen($)
    void refreshBeadsIfOpen($)
    $.clock.every(BEADS_EVERY_MS, () => void refreshBeadsIfOpen($))
    return started
  })

  on('command.run', { command: 'beadwork' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Beadwork' })
    void refreshTasks($)
    void refreshBeads($)
    return { text: 'Beadwork pane opened.' }
  })

  for (const tool of TASK_TOOLS) {
    on('tool.call', { tool }, async ($, e, next) => {
      const ran = await next(e)
      void refreshTasksIfOpen($)
      return ran
    })
  }

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    if (/(^|[\s;&|(])bd\s/.test(String(e.command))) void refreshBeadsIfOpen($)
    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const t = await read($, tasks)
    const b = await read($, beads)
    const rows = Math.max(6, (e.viewport?.rows ?? 24) - 2)
    const taskRoom = Math.max(1, Math.min(t.list.length, Math.floor(rows / 2) - 2))

    const done = t.list.filter(x => x.status === 'completed').length
    const taskHeader =
      t.available === null ? 'Claude tasks · checking…'
      : !t.available ? 'Claude tasks · unavailable here'
      : t.list.length === 0 ? 'Claude tasks · none'
      : `Claude tasks · ${done}/${t.list.length} done`

    const groups = b.groups.map(g => ({ ...g, rows: layoutTracker(g.items) }))
    // Rows left after the task section, split evenly; each group spends one on its header.
    const beadRoom = Math.max(2, rows - taskRoom - 5)
    const perGroup = Math.max(1, Math.floor(beadRoom / Math.max(1, groups.length)) - 1)

    return (
      <Box flexDirection="column">
        <Text bold>{taskHeader}</Text>
        {t.available === false && <Text dimColor>No task tools in this session.</Text>}
        {t.available && t.list.length === 0 && <Text dimColor>The list is empty.</Text>}
        {t.list.slice(-taskRoom).map(x => (
          <Text
            wrap="truncate-end"
            dimColor={x.status === 'completed'}
            strikethrough={x.status === 'completed'}
            bold={x.status === 'in_progress'}
            color={x.status === 'in_progress' ? 'yellow' : undefined}
          >
            {MARK[x.status]} {x.status === 'in_progress' && x.activeForm ? x.activeForm : x.subject}
          </Text>
        ))}

        <Text> </Text>
        <Text bold>Beads</Text>
        {b.error && <Text dimColor>{b.error}</Text>}
        {!b.error && groups.length === 0 && <Text dimColor>Loading…</Text>}
        {groups.map(g => {
          const work = g.items.filter(x => x.type !== 'epic')
          const active = work.filter(x => x.status === 'in_progress').length
          const epics = g.items.length - work.length
          const shown = g.rows.slice(0, g.rows.length > perGroup ? perGroup - 1 : perGroup)
          return (
            <Box flexDirection="column">
              <Text wrap="truncate-end">
                <Text bold color="cyan">{g.label}</Text>
                <Text dimColor>{g.error ? ' · unavailable' : ` · ${active} active, ${work.length - active} open${epics ? `, ${epics} epic${epics === 1 ? '' : 's'}` : ''}`}</Text>
              </Text>
              {g.error && <Text dimColor wrap="truncate-end">  {g.error}</Text>}
              {!g.error && g.items.length === 0 && <Text dimColor>  Nothing open.</Text>}
              {shown.map(({ bead: x, depth, heads }) => {
                const pad = '  '.repeat(depth + 1)
                if (heads !== undefined) {
                  return (
                    <Text wrap="truncate-end">
                      {pad}<Text bold color="magenta">▾ {x.title}</Text> <Text dimColor>{x.id} · {heads === 0 ? 'nothing open under it' : `${heads} open`}</Text>
                    </Text>
                  )
                }
                return (
                  <Text
                    wrap="truncate-end"
                    bold={x.status === 'in_progress'}
                    color={x.status === 'in_progress' ? 'yellow' : undefined}
                  >
                    {pad}{x.status === 'in_progress' ? '◐' : '○'} <Text dimColor>P{x.priority}</Text> {x.title} <Text dimColor>{x.id}</Text>
                  </Text>
                )
              })}
              {shown.length < g.rows.length && <Text dimColor>  …{g.rows.length - shown.length} more</Text>}
            </Box>
          )
        })}
      </Box>
    )
  })
}
