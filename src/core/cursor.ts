import { AnimatedSprite, Container } from 'pixi.js'
import { useApplication, useRenderer, useStage } from 'vue3-pixi'
import { WAS } from '~/lib/WAS'
import { WDFManager } from '~/lib/WDFManager'
import Cursors from '~/data/cursor'
import { settings } from '~/settings'

const app = useApplication()
const renderer = useRenderer()
const stage = useStage()

export class Cursor extends Container {
    private static instance: Cursor

    modes: Record<string, AnimatedSprite>

    mode: string

    constructor() {
        super()
        this.mode = 'default'
        this.modes = {}
    }

    async setup() {
        const wdfManager = WDFManager.getInstance()
        for (const key in Cursors) {
            const was = await wdfManager.get(Cursors[key][0], Cursors[key][1])
            if (was instanceof WAS) {
                const frames = was.readFrames(settings.ui_duration)[0]
                const ani = new AnimatedSprite(frames, true)
                this.modes[key] = ani
                ani.updateAnchor = true
                ani.anchor.set(was.x / was.width, was.y / was.height)
                ani.play()
                ani.visible = key === 'default'
                ani.eventMode = 'none'
                this.addChild(ani)
            }
            renderer.value.events.cursorStyles[key] = (mode: string) => {
                this.modes[this.mode].visible = false
                this.mode = mode
                this.modes[mode].visible = true
            }
        }

        stage.value.eventMode = 'auto'
        stage.value.hitArea = app.value.screen

        renderer.value.events.domElement.style.cursor = 'none'

        app.value.ticker.add(() => {
            this.position = renderer.value.events.pointer
        })
    }

    public static async getInstance() {
        if (!Cursor.instance) {
            Cursor.instance = new Cursor()
            await Cursor.instance.setup()
            return Cursor.instance
        }

        return Cursor.instance
    }
}

export async function getCursor(): Promise<Cursor> {
    return await Cursor.getInstance()
}
