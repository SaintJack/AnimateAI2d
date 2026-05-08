import { Container } from 'pixi.js'

export interface Layers {
  root: Container
  background: Container
  camera: Container
  world: Container
  characters: Container
  effects: Container
  ui: Container
}

export function createLayers(): Layers {
  const root = new Container()
  const background = new Container()
  const camera = new Container()
  const world = new Container()
  const characters = new Container()
  const effects = new Container()
  const ui = new Container()

  root.addChild(background)
  root.addChild(camera)
  camera.addChild(world)
  world.addChild(characters)
  world.addChild(effects)
  root.addChild(ui)

  return {
    root,
    background,
    camera,
    world,
    characters,
    effects,
    ui,
  }
}

