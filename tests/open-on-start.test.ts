import { expect, test } from 'claude-code/testing'

// Stand in for the engine: a terminal session, no pane up yet. Records each
// pane the plugin opens.
function engine(on: any): string[] {
  const opened: string[] = []
  on('command.register', () => ({ value: { command: 'beadwork' } }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', (_: any, e: any) => {
    opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  on('session.surfaces', () => ({ value: ['terminal'] }))
  on('env.get', () => ({ value: undefined }))
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  // What the pane's first refresh reaches: no tasks, no .beads anywhere.
  on('session.cwd', () => ({ value: '/' }))
  on('session.root', () => ({ value: '/' }))
  on('fs.exists', () => ({ value: false }))
  on('tool.call', () => ({ result: { tasks: [] } }))
  return opened
}

test('openOnStart opens the pane at session start', { options: { openOnStart: true } }, async ($, on) => {
  const opened = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(opened).toEqual(['beadwork'])
  // Let the pane's first refresh (fired, not awaited) finish inside the test.
  await new Promise(resolve => setTimeout(resolve, 50))
})

test('by default the pane waits for /beadwork', async ($, on) => {
  const opened = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(opened).toEqual([])
})
