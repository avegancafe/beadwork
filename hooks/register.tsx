import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Bead, BeadState, Task, TaskState, TaskStatus } from '../types'

const PANE = 'beadwork'
const BEADS_EVERY_MS = 10_000
const TASK_TOOLS = ['TaskCreate', 'TaskUpdate', 'TodoWrite']

const tasks = atom({ plugin: 'beadwork', key: 'tasks' } as const, { available: null, list: [] } as TaskState)
const beads = atom({ plugin: 'beadwork', key: 'beads' } as const, { items: [] } as BeadState)

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

let refreshingTasks: Promise<void> | undefined

function refreshTasks($: any): Promise<void> {
  return (refreshingTasks ??= (async () => {
    try {
      const ran = await $.tool.call({ tool: 'TaskList' })
      const list = ran.deny === undefined && !ran.isError ? parseTaskList(ran.result, ran.text ?? '') : []
      $.ui.log(`TaskList → ${list.length} tasks; raw: ${JSON.stringify(ran.result ?? ran.text ?? ran.deny).slice(0, 400)}`, { to: 'debug' })
      await update($, tasks, () => ({ available: ran.deny === undefined, list }))
    } catch (err) {
      // Rejects when this session has no TaskList tool (e.g. the desktop Code tab).
      $.ui.log(`TaskList unavailable: ${String(err)}`, { to: 'debug' })
      await update($, tasks, () => ({ available: false, list: [] }))
    } finally {
      refreshingTasks = undefined
    }
  })())
}

async function refreshBeads($: any): Promise<void> {
  try {
    const { exitCode, stdout, stderr } = await $.process.run(
      ['bd', 'list', '--status=open,in_progress', '--json'],
      { timeoutMs: 15_000 },
    )
    if (exitCode !== 0) {
      const why = (stderr || stdout).split('\n')[0] || `bd exited ${exitCode}`
      await update($, beads, b => ({ ...b, items: [], error: why, refreshedAt: Date.now() }))
      return
    }
    const items: Bead[] = (JSON.parse(stdout || '[]') as any[]).map(b => ({
      id: String(b.id),
      title: String(b.title ?? ''),
      status: String(b.status ?? 'open'),
      priority: Number(b.priority ?? 4),
      type: String(b.issue_type ?? 'task'),
    }))
    await update($, beads, () => ({ items, refreshedAt: Date.now() }))
  } catch (err) {
    await update($, beads, b => ({ ...b, error: `bd unavailable: ${String(err).slice(0, 80)}` }))
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await $.command.register({ name: 'beadwork', description: 'Open the beadwork pane: Claude tasks + open beads' })
    void $.ui.open({ id: PANE, title: 'Beadwork' })
    void refreshTasks($)
    void refreshBeads($)
    $.clock.every(BEADS_EVERY_MS, () => void refreshBeads($))
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
      void refreshTasks($)
      return ran
    })
  }

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    if (/(^|[\s;&|(])bd\s/.test(String(e.command))) void refreshBeads($)
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

    const sorted = [...b.items].sort(
      (x, y) => Number(y.status === 'in_progress') - Number(x.status === 'in_progress') || x.priority - y.priority,
    )
    const active = sorted.filter(x => x.status === 'in_progress').length
    const beadRoom = Math.max(1, rows - taskRoom - 5)

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
        <Text bold>
          {b.error ? 'Beads · unavailable' : `Beads · ${active} active, ${b.items.length - active} open`}
        </Text>
        {b.error && <Text dimColor wrap="truncate-end">{b.error}</Text>}
        {!b.error && b.items.length === 0 && <Text dimColor>{b.refreshedAt ? 'Nothing open.' : 'Loading…'}</Text>}
        {sorted.slice(0, beadRoom).map(x => (
          <Text
            wrap="truncate-end"
            bold={x.status === 'in_progress'}
            color={x.status === 'in_progress' ? 'yellow' : undefined}
          >
            {x.status === 'in_progress' ? '◐' : '○'} <Text dimColor>P{x.priority}</Text> {x.title} <Text dimColor>{x.id}</Text>
          </Text>
        ))}
        {sorted.length > beadRoom && <Text dimColor>…{sorted.length - beadRoom} more</Text>}
      </Box>
    )
  })
}
