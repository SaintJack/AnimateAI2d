import { Assets } from 'pixi.js'
import { Spine } from '@esotericsoftware/spine-pixi-v8'

export type TalkMode = 'action' | 'track'

export interface SpinePrefab {
  prefabId: string
  skeletonSrc: string
  atlasSrc: string
  scale?: number
  animations: {
    idle: string
    talk?: string
    blink?: string
  }
  talk?: {
    mode: TalkMode
    action?: string
    trackAnimation?: string
    trackIndex?: number
  }
  emotions?: Record<string, string>
}

export class SpineLoader {
  async load(prefab: SpinePrefab): Promise<Spine> {
    const skeletonAlias = `spine:${prefab.prefabId}:skeleton`
    const atlasAlias = `spine:${prefab.prefabId}:atlas`

    if (!Assets.get(skeletonAlias)) Assets.add({ alias: skeletonAlias, src: prefab.skeletonSrc })
    if (!Assets.get(atlasAlias)) Assets.add({ alias: atlasAlias, src: prefab.atlasSrc })

    await Assets.load([skeletonAlias, atlasAlias])

    return Spine.from({
      skeleton: skeletonAlias,
      atlas: atlasAlias,
      autoUpdate: false,
      scale: prefab.scale ?? 1,
    })
  }
}

export class SpineCharacterView {
  readonly node: Spine
  private readonly prefab: SpinePrefab
  private baseAction: string
  private talkEnabled = false

  constructor(node: Spine, prefab: SpinePrefab) {
    this.node = node
    this.prefab = prefab
    this.baseAction = prefab.animations.idle
  }

  setAction(action: string, loop: boolean) {
    this.baseAction = action
    if (this.talkEnabled && this.prefab.talk?.mode === 'action' && this.prefab.talk.action) {
      this.node.state.setAnimation(0, this.prefab.talk.action, true)
      return
    }
    this.node.state.setAnimation(0, this.baseAction, loop)
  }

  setEmotion(emotion: string) {
    const anim = this.prefab.emotions?.[emotion]
    if (!anim) return
    const entry = this.node.state.setAnimation(2, anim, false)
    entry.mixDuration = 0.12
  }

  setTalkEnabled(enabled: boolean) {
    this.talkEnabled = enabled

    const talk = this.prefab.talk
    if (!talk) return

    if (talk.mode === 'action') {
      if (enabled && talk.action) {
        this.node.state.setAnimation(0, talk.action, true)
      } else {
        this.node.state.setAnimation(0, this.baseAction, true)
      }
      return
    }

    const trackIndex = talk.trackIndex ?? 1
    if (enabled && talk.trackAnimation) {
      this.node.state.setAnimation(trackIndex, talk.trackAnimation, true)
    } else {
      this.node.state.clearTrack(trackIndex)
    }
  }

  update(dtSeconds: number) {
    this.node.update(dtSeconds)
  }
}

