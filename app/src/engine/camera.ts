import gsap from 'gsap'
import { Container } from 'pixi.js'

export interface ShotPreset {
  zoom: number
  offsetX: number
  offsetY: number
}

export class CameraController {
  private readonly camera: Container
  private baseX = 0
  private baseY = 0
  private baseZoom = 1
  private shakeTween: gsap.core.Tween | null = null

  constructor(cameraContainer: Container) {
    this.camera = cameraContainer
    this.baseX = cameraContainer.position.x
    this.baseY = cameraContainer.position.y
    this.baseZoom = cameraContainer.scale.x
  }

  setImmediate(preset: ShotPreset) {
    this.baseZoom = preset.zoom
    this.baseX = preset.offsetX
    this.baseY = preset.offsetY
    this.camera.scale.set(this.baseZoom)
    this.camera.position.set(this.baseX, this.baseY)
  }

  toShot(preset: ShotPreset, durationSeconds: number) {
    this.baseZoom = preset.zoom
    this.baseX = preset.offsetX
    this.baseY = preset.offsetY

    gsap.to(this.camera.scale, {
      x: this.baseZoom,
      y: this.baseZoom,
      duration: durationSeconds,
      ease: 'power2.out',
    })

    gsap.to(this.camera.position, {
      x: this.baseX,
      y: this.baseY,
      duration: durationSeconds,
      ease: 'power2.out',
    })
  }

  panTo(x: number, y: number, durationSeconds: number) {
    this.baseX = x
    this.baseY = y
    gsap.to(this.camera.position, {
      x: this.baseX,
      y: this.baseY,
      duration: durationSeconds,
      ease: 'power2.out',
    })
  }

  zoomTo(zoom: number, durationSeconds: number) {
    this.baseZoom = zoom
    gsap.to(this.camera.scale, {
      x: this.baseZoom,
      y: this.baseZoom,
      duration: durationSeconds,
      ease: 'power2.out',
    })
  }

  shake(amplitude: number, durationSeconds: number) {
    if (this.shakeTween) this.shakeTween.kill()
    const obj = { t: 0 }
    this.shakeTween = gsap.to(obj, {
      t: 1,
      duration: durationSeconds,
      ease: 'none',
      onUpdate: () => {
        const strength = (1 - obj.t) * amplitude
        const dx = (Math.random() * 2 - 1) * strength
        const dy = (Math.random() * 2 - 1) * strength
        this.camera.position.set(this.baseX + dx, this.baseY + dy)
      },
      onComplete: () => {
        this.camera.position.set(this.baseX, this.baseY)
        this.shakeTween = null
      },
    })
  }
}

