export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type Task = { id: string; subject: string; status: TaskStatus; activeForm?: string }
/** `available` is null until the first TaskList probe answers. */
export type TaskState = { available: boolean | null; list: Task[] }

export type Bead = { id: string; title: string; status: string; priority: number; type: string }
/** `error` is set when bd failed (e.g. no beads workspace for this cwd). */
export type BeadState = { items: Bead[]; error?: string; refreshedAt?: number }

declare module 'claude-code' {
  interface PluginState {
    'beadwork': { tasks: TaskState; beads: BeadState }
  }
}
