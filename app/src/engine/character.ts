import { Container } from 'pixi.js'
import type { SpinePrefab } from './spine'
import { SpineCharacterView, SpineLoader } from './spine'

export type CharacterId = string

export interface CharacterSpawnOptions {
  id: CharacterId
  prefab: SpinePrefab
  x: number
  y: number
  scale: number
}

export interface CharacterStateSnapshot {
  id: CharacterId
  action: string
  emotion: string
  talkEnabled: boolean
  x: number
  y: number
  scale: number
}

export class Character {
  readonly id: CharacterId
  private readonly loader: SpineLoader
  private readonly layer: Container
  private readonly prefab: SpinePrefab

  private view: SpineCharacterView | null = null
  private action = 'idle'
  private emotion = 'neutral'
  private talkEnabled = false

  private x: number
  private y: number
  private scale: number

  constructor(loader: SpineLoader, charactersLayer: Container, options: CharacterSpawnOptions) {
    this.loader = loader
    this.layer = charactersLayer
    this.id = options.id
    this.prefab = options.prefab
    this.x = options.x
    this.y = options.y
    this.scale = options.scale
    this.action = options.prefab.animations.idle
  }

  async spawn() {
    const node = await this.loader.load(this.prefab)
    node.position.set(this.x, this.y)
    node.scale.set(this.scale)
    this.view = new SpineCharacterView(node, this.prefab)
    this.layer.addChild(node)
    this.view.setAction(this.action, true)
    this.view.setEmotion(this.emotion)
    this.view.setTalkEnabled(this.talkEnabled)
  }

  destroy() {
    if (!this.view) return
    this.view.node.destroy({ children: true })
    this.view = null
  }

  setTransform(x: number, y: number, scale: number) {
    this.x = x
    this.y = y
    this.scale = scale
    if (!this.view) return
    this.view.node.position.set(this.x, this.y)
    this.view.node.scale.set(this.scale)
  }

  setAction(action: string, loop: boolean) {
    this.action = action
    this.view?.setAction(action, loop)
  }

  setEmotion(emotion: string) {
    this.emotion = emotion
    this.view?.setEmotion(emotion)
  }

  setTalkEnabled(enabled: boolean) {
    this.talkEnabled = enabled
    this.view?.setTalkEnabled(enabled)
  }

  update(dtSeconds: number) {
    this.view?.update(dtSeconds)
  }

  getSnapshot(): CharacterStateSnapshot {
    return {
      id: this.id,
      action: this.action,
      emotion: this.emotion,
      talkEnabled: this.talkEnabled,
      x: this.x,
      y: this.y,
      scale: this.scale,
    }
  }
}

