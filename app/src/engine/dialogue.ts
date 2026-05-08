import { Container, Graphics, Text } from 'pixi.js'

export class DialogueController {
  private readonly root: Container
  private readonly panel: Graphics
  private readonly text: Text

  constructor(uiLayer: Container) {
    this.root = new Container()
    this.panel = new Graphics()
    this.text = new Text({
      text: '',
      style: {
        fill: 0xffffff,
        fontSize: 18,
        wordWrap: true,
        wordWrapWidth: 860,
      },
    })

    this.panel.fill({ color: 0x000000, alpha: 0.45 })
    this.panel.roundRect(0, 0, 920, 120, 14)

    this.root.addChild(this.panel)
    this.text.position.set(18, 14)
    this.root.addChild(this.text)

    this.root.position.set(24, 24)
    uiLayer.addChild(this.root)
  }

  say(speakerId: string, text: string) {
    const prefix = speakerId ? `${speakerId}: ` : ''
    this.text.text = `${prefix}${text}`
  }
}

