export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type Task = { id: string; subject: string; status: TaskStatus; activeForm?: string }
/** `available` is null until the first TaskList probe answers. */
export type TaskState = { available: boolean | null; list: Task[] }

/** `parent` is the bead's parent id (an epic, usually); absent when it has none. */
export type Bead = { id: string; title: string; status: string; priority: number; type: string; parent?: string }
/** One beads tracker: the folder holding its `.beads`, and what bd listed there. */
export type BeadGroup = { root: string; label: string; items: Bead[]; error?: string }
/** Trackers nearest the session's cwd first; `error` when none was found at all. */
export type BeadState = { groups: BeadGroup[]; error?: string; refreshedAt?: number }

declare module 'claude-code' {
  interface PluginState {
    'beadwork': { tasks: TaskState; beads: BeadState }
  }
}
