export interface SceneDsl {
  version: string
  scene: {
    id: string
    background?: { assetId: string; src?: string }
  }
  characters?: Array<{
    id: string
    prefabId: string
    transform?: { x?: number; y?: number; scale?: number }
    state?: { action?: string; emotion?: string }
  }>
  camera?: { shot?: string }
  timeline: Array<{ t: number; cmd: string; args?: Record<string, unknown> }>
}

export interface SceneProgram {
  sceneId: string
  background?: { assetId: string; src?: string }
  initialCharacters: NonNullable<SceneDsl['characters']>
  initialShot?: string
  events: Array<{ t: number; cmd: string; args: Record<string, unknown> }>
}

export function parseSceneDsl(input: unknown): SceneDsl {
  if (!input || typeof input !== 'object') throw new Error('DSL must be an object')
  return input as SceneDsl
}

export function compileSceneDsl(dsl: SceneDsl): SceneProgram {
  if (!dsl.version) throw new Error('DSL.version is required')
  if (!dsl.scene?.id) throw new Error('DSL.scene.id is required')
  if (!Array.isArray(dsl.timeline)) throw new Error('DSL.timeline must be an array')

  const events = dsl.timeline.map((e, idx) => {
    if (typeof e !== 'object' || e === null) throw new Error(`timeline[${idx}] invalid`)
    if (typeof e.t !== 'number' || Number.isNaN(e.t)) throw new Error(`timeline[${idx}].t invalid`)
    if (typeof e.cmd !== 'string' || !e.cmd) throw new Error(`timeline[${idx}].cmd invalid`)
    return { t: e.t, cmd: e.cmd, args: (e.args ?? {}) as Record<string, unknown> }
  })

  events.sort((a, b) => a.t - b.t)

  return {
    sceneId: dsl.scene.id,
    background: dsl.scene.background,
    initialCharacters: dsl.characters ?? [],
    initialShot: dsl.camera?.shot,
    events,
  }
}

