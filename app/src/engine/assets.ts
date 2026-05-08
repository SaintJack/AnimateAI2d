import { Assets, Texture } from 'pixi.js'

export class AssetManager {
  async loadTexture(alias: string, src: string): Promise<Texture> {
    if (!Assets.get(alias)) {
      Assets.add({ alias, src })
    }
    return (await Assets.load(alias)) as Texture
  }
}

