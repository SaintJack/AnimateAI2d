export interface TimelineEvent {
  t: number
  cmd: string
  args: Record<string, unknown>
}

export type TimelineExecutor = (event: TimelineEvent) => Promise<void> | void

export class Timeline {
  private events: TimelineEvent[] = []
  private cursor = 0
  private time = 0
  private running = false
  private executor: TimelineExecutor | null = null

  start(events: TimelineEvent[], executor: TimelineExecutor) {
    this.events = [...events].sort((a, b) => a.t - b.t)
    this.cursor = 0
    this.time = 0
    this.running = true
    this.executor = executor
  }

  stop() {
    this.running = false
  }

  update(dtSeconds: number) {
    if (!this.running || !this.executor) return
    this.time += dtSeconds

    while (this.cursor < this.events.length && this.events[this.cursor].t <= this.time) {
      const e = this.events[this.cursor]
      this.cursor += 1
      this.executor(e)
    }
  }
}

