import heroImg from './assets/hero.png'
import type { SceneDsl } from './engine/dsl'
import type { BackgroundRegistry, PrefabRegistry } from './engine/engine'

export const backgrounds: BackgroundRegistry = {
  bg_demo: heroImg,
}

export const prefabs: PrefabRegistry = {
  spineboy: {
    prefabId: 'spineboy',
    skeletonSrc: '/assets/spine/spineboy/skeleton.json',
    atlasSrc: '/assets/spine/spineboy/skeleton.atlas',
    scale: 1,
    animations: {
      idle: 'idle',
      talk: 'talk',
      blink: 'blink',
    },
    talk: { mode: 'action', action: 'talk' },
    emotions: {
      happy: 'jump',
      sad: 'death',
      angry: 'shoot',
    },
  },
}

export const demoDsl: SceneDsl = {
  version: '1.0',
  scene: {
    id: 'demo',
    background: { assetId: 'bg_demo' },
  },
  characters: [
    {
      id: 'spineboy_01',
      prefabId: 'spineboy',
      transform: { x: 520, y: 920, scale: 0.6 },
      state: { action: 'idle', emotion: 'neutral' },
    },
  ],
  camera: { shot: 'medium' },
  timeline: [
    { t: 0.0, cmd: 'Dialogue.Say', args: { id: 'spineboy_01', text: 'M1 演出闭环示例' } },
    { t: 0.2, cmd: 'Character.Talk', args: { id: 'spineboy_01', enabled: true } },
    { t: 2.0, cmd: 'Character.Talk', args: { id: 'spineboy_01', enabled: false } },
    { t: 2.2, cmd: 'Camera.ToShot', args: { shot: 'close', duration: 0.6 } },
    { t: 3.1, cmd: 'Camera.ToShot', args: { shot: 'wide', duration: 0.8 } },
    { t: 4.2, cmd: 'Character.SetEmotion', args: { id: 'spineboy_01', emotion: 'happy' } },
    { t: 4.4, cmd: 'Camera.Shake', args: { amplitude: 10, duration: 0.35 } },
  ],
}

