import './style.css'
import { Application, Ticker } from 'pixi.js'
import { demoDsl, backgrounds, prefabs } from './demo'
import { compileSceneDsl, parseSceneDsl } from './engine/dsl'
import { EngineRuntime } from './engine/engine'

async function bootstrap() {
  const root = document.querySelector<HTMLDivElement>('#app')
  if (!root) throw new Error('#app not found')

  root.innerHTML = `<div id="stage"></div><div id="hud"></div>`

  const stage = document.querySelector<HTMLDivElement>('#stage')
  const hud = document.querySelector<HTMLDivElement>('#hud')
  if (!stage || !hud) throw new Error('stage/hud not found')

  const lines: string[] = []
  const push = (msg: string) => {
    lines.unshift(msg)
    if (lines.length > 8) lines.pop()
    hud.textContent = lines.join('\n')
  }

  const app = new Application()
  await app.init({
    background: '#16171d',
    resizeTo: window,
    antialias: true,
  })
  stage.appendChild(app.canvas)

  const engine = new EngineRuntime(app, {
    backgrounds,
    onLog: (m) => push(m),
    onError: (m) => push(`ERR: ${m}`),
  })
  engine.init()

  const program = compileSceneDsl(parseSceneDsl(demoDsl))
  await engine.load(program, prefabs)

  app.ticker.add((ticker: Ticker) => {
    engine.update(ticker.deltaMS / 1000)
    const size = `${Math.round(app.renderer.width)}×${Math.round(app.renderer.height)}`
    if (!lines.length || !lines[0].includes('Viewport')) push(`Viewport: ${size}`)
  })
}

bootstrap()
