import { Application, Sprite } from 'pixi.js'
import { AssetManager } from './assets'
import { CameraController, type ShotPreset } from './camera'
import { Character } from './character'
import { DialogueController } from './dialogue'
import { createLayers, type Layers } from './layers'
import { type SceneProgram } from './dsl'
import { SpineLoader, type SpinePrefab } from './spine'
import { Timeline, type TimelineEvent } from './timeline'

export type BackgroundRegistry = Record<string, string>
export type PrefabRegistry = Record<string, SpinePrefab>

export interface EngineOptions {
  backgrounds?: BackgroundRegistry
  shots?: Record<string, ShotPreset>
  onLog?: (message: string) => void
  onError?: (message: string) => void
}

export class EngineRuntime {
  private readonly app: Application
  private readonly options: EngineOptions

  private readonly assets = new AssetManager()
  private readonly spine = new SpineLoader()
  private readonly timeline = new Timeline()

  private layers: Layers | null = null
  private camera: CameraController | null = null
  private dialogue: DialogueController | null = null

  private backgroundSprite: Sprite | null = null
  private characters = new Map<string, Character>()

  constructor(app: Application, options: EngineOptions = {}) {
    this.app = app
    this.options = options
  }

  init() {
    const layers = createLayers()
    this.layers = layers
    this.app.stage.addChild(layers.root)
    this.camera = new CameraController(layers.camera)
    this.dialogue = new DialogueController(layers.ui)
  }

  async load(program: SceneProgram, prefabs: PrefabRegistry) {
    if (!this.layers || !this.camera) throw new Error('EngineRuntime.init must be called first')

    this.options.onLog?.(`Scene: ${program.sceneId}`)

    if (program.background) {
      try {
        await this.setBackground(program.background.assetId, program.background.src)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        this.options.onError?.(`Background load failed: ${msg}`)
      }
    }

    if (program.initialShot) {
      const preset = this.getShot(program.initialShot)
      if (preset) this.camera.setImmediate(preset)
    }

    for (const c of program.initialCharacters) {
      const prefab = prefabs[c.prefabId]
      if (!prefab) {
        this.options.onError?.(`Prefab not found: ${c.prefabId}`)
        continue
      }
      const x = c.transform?.x ?? 520
      const y = c.transform?.y ?? 820
      const scale = c.transform?.scale ?? 1
      try {
        await this.spawnCharacter(c.id, prefab, x, y, scale)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        this.options.onError?.(`Character spawn failed (${c.id}): ${msg}`)
        continue
      }
      if (c.state?.action) this.characters.get(c.id)?.setAction(c.state.action, true)
      if (c.state?.emotion) this.characters.get(c.id)?.setEmotion(c.state.emotion)
    }

    this.timeline.start(program.events as TimelineEvent[], (e) => void this.execute(e, prefabs))
  }

  update(dtSeconds: number) {
    this.timeline.update(dtSeconds)
    for (const c of this.characters.values()) c.update(dtSeconds)
  }

  private getShot(name: string): ShotPreset | null {
    const shots = this.options.shots ?? {
      wide: { zoom: 0.85, offsetX: 0, offsetY: 0 },
      medium: { zoom: 1.05, offsetX: 0, offsetY: -40 },
      close: { zoom: 1.3, offsetX: 0, offsetY: -80 },
    }
    return shots[name] ?? null
  }

  private async setBackground(assetId: string, src?: string) {
    if (!this.layers) return

    const resolvedSrc = src ?? this.options.backgrounds?.[assetId]
    if (!resolvedSrc) {
      this.options.onError?.(`Background src not found for assetId: ${assetId}`)
      return
    }

    const texture = await this.assets.loadTexture(`bg:${assetId}`, resolvedSrc)
    if (!this.backgroundSprite) {
      this.backgroundSprite = new Sprite(texture)
      this.layers.background.addChild(this.backgroundSprite)
    } else {
      this.backgroundSprite.texture = texture
    }
    this.backgroundSprite.position.set(0, 0)
  }

  private async spawnCharacter(id: string, prefab: SpinePrefab, x: number, y: number, scale: number) {
    if (!this.layers) return
    if (this.characters.has(id)) {
      this.characters.get(id)?.destroy()
      this.characters.delete(id)
    }
    const c = new Character(this.spine, this.layers.characters, { id, prefab, x, y, scale })
    this.characters.set(id, c)
    await c.spawn()
  }

  private getCharacter(id: string) {
    const c = this.characters.get(id)
    if (!c) this.options.onError?.(`Character not found: ${id}`)
    return c
  }

  private async execute(e: TimelineEvent, prefabs: PrefabRegistry) {
    try {
      switch (e.cmd) {
        case 'Scene.SetBackground': {
          const assetId = String(e.args.assetId ?? '')
          const src = typeof e.args.src === 'string' ? e.args.src : undefined
          if (assetId) await this.setBackground(assetId, src)
          break
        }
        case 'Character.Spawn': {
          const id = String(e.args.id ?? '')
          const prefabId = String(e.args.prefabId ?? '')
          const prefab = prefabs[prefabId]
          if (!id || !prefab) {
            this.options.onError?.(`Character.Spawn invalid args: ${JSON.stringify(e.args)}`)
            break
          }
          const x = Number(e.args.x ?? 520)
          const y = Number(e.args.y ?? 820)
          const scale = Number(e.args.scale ?? 1)
          await this.spawnCharacter(id, prefab, x, y, scale)
          break
        }
        case 'Character.SetTransform': {
          const id = String(e.args.id ?? '')
          const x = Number(e.args.x ?? 0)
          const y = Number(e.args.y ?? 0)
          const scale = Number(e.args.scale ?? 1)
          this.getCharacter(id)?.setTransform(x, y, scale)
          break
        }
        case 'Character.SetAction': {
          const id = String(e.args.id ?? '')
          const action = String(e.args.action ?? '')
          const loop = Boolean(e.args.loop ?? true)
          if (action) this.getCharacter(id)?.setAction(action, loop)
          break
        }
        case 'Character.SetEmotion': {
          const id = String(e.args.id ?? '')
          const emotion = String(e.args.emotion ?? '')
          if (emotion) this.getCharacter(id)?.setEmotion(emotion)
          break
        }
        case 'Character.Talk': {
          const id = String(e.args.id ?? '')
          const enabled = Boolean(e.args.enabled ?? false)
          this.getCharacter(id)?.setTalkEnabled(enabled)
          break
        }
        case 'Camera.ToShot': {
          const shot = String(e.args.shot ?? '')
          const duration = Number(e.args.duration ?? 0.6)
          const preset = shot ? this.getShot(shot) : null
          if (preset && this.camera) this.camera.toShot(preset, duration)
          break
        }
        case 'Camera.PanTo': {
          const x = Number(e.args.x ?? 0)
          const y = Number(e.args.y ?? 0)
          const duration = Number(e.args.duration ?? 0.6)
          this.camera?.panTo(x, y, duration)
          break
        }
        case 'Camera.ZoomTo': {
          const zoom = Number(e.args.zoom ?? 1)
          const duration = Number(e.args.duration ?? 0.6)
          this.camera?.zoomTo(zoom, duration)
          break
        }
        case 'Camera.Shake': {
          const amplitude = Number(e.args.amplitude ?? 8)
          const duration = Number(e.args.duration ?? 0.35)
          this.camera?.shake(amplitude, duration)
          break
        }
        case 'Dialogue.Say': {
          const id = String(e.args.id ?? '')
          const text = String(e.args.text ?? '')
          this.dialogue?.say(id, text)
          break
        }
        default: {
          this.options.onError?.(`Unknown cmd: ${e.cmd}`)
          break
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      this.options.onError?.(`Command failed: ${e.cmd} | ${msg}`)
    }
  }
}
