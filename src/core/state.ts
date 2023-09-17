import { AnimatedSprite, Container } from 'pixi.js'
import type { Character } from './character'
import { WDFManager } from '~/lib/WDFManager'
import type { WAS } from '~/lib/WAS'
import { settings } from '~/settings'

export class State extends Container<AnimatedSprite> {
    direction_num: number

    wdf: string

    hash_or_path: string | number

    declare parent: Character

    constructor(wdf: string, hash_or_path: string | number) {
        super()
        this.direction_num = 0
        this.wdf = wdf
        this.hash_or_path = hash_or_path
    }

    async setup() {
        const wdfManager = WDFManager.getInstance()
        const was: WAS = await wdfManager.get(this.wdf, this.hash_or_path) as WAS
        this.direction_num = was.direction_num
        const frames = was.readFrames(settings.action_duration)
        for (let i = 0; i < this.direction_num; i++) {
            const ani = new AnimatedSprite(frames[i], true)
            ani.onLoop = () => this.onLoop()
            ani.updateAnchor = true
            ani.anchor.set(was.x / was.width, was.y / was.height)
            ani.visible = false
            ani.eventMode = 'none'
            this.addChild(ani)
        }
    }

    onLoop() {
        //
    }

    stop(d: number) {
        this.getChildAt(d).stop()
        this.getChildAt(d).visible = false
    }

    play(d: number) {
        this.getChildAt(d).gotoAndPlay(0)
        this.getChildAt(d).visible = true
    }
}

export class StandState extends State {
    loop_count = 0
    loop_max = 3
    other = 'stand2'
    onLoop() {
        if (this.loop_count >= this.loop_max) {
            this.loop_count = 0
            this.parent.switchState(this.other)
        }
        this.loop_count++
    }
}

export class Stand2State extends StandState {
    loop_max = 1
    loop_count = 0
    other = 'stand'
}

export async function get_state(state: string, wdf: string, hash_or_path: string | number) {
    let _state
    if (state === 'stand')
        _state = new StandState(wdf, hash_or_path)

    else if (state === 'stand2')
        _state = new Stand2State(wdf, hash_or_path)

    else
        _state = new State(wdf, hash_or_path)

    await _state.setup()
    return _state
}
