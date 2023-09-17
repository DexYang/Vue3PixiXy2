import type { DisplayObject } from 'pixi.js'
import { Sprite } from 'pixi.js'

export function centerObjects(...toCenter: DisplayObject[]) {
    const center = (obj: DisplayObject) => {
        obj.x = window.innerWidth / 2
        obj.y = window.innerHeight / 2

        if (obj instanceof Sprite)
            obj.anchor.set(0.5)
    }

    toCenter.forEach(center)
}

export function centerObject(obj: DisplayObject, offset_x = 0, offset_y = 0, center_anchor = true) {
    obj.x = window.innerWidth / 2
    obj.y = window.innerHeight / 2

    if (center_anchor && obj instanceof Sprite)
        obj.anchor.set(0.5)

    obj.x += offset_x
    obj.y += offset_y
}

export function wait(seconds: number) {
    return new Promise<void>((resolve: any) => setTimeout(resolve, seconds * 1000))
}

export async function after(
    seconds: number,
    callback: (...args: unknown[]) => unknown
) {
    await wait(seconds)
    return callback()
}

export function getEntries<T extends object>(obj: T) {
    return Object.entries(obj)
}

function calcAngle(x1: number, y1: number, x2: number, y2: number) {
    const x = x2 - x1
    const y = y1 - y2
    const π = 3.1415926
    const θ = Math.atan2(y, x) * (180 / π)
    return Math.floor(θ)
}

export function calcDirection8(x1: number, y1: number, x2: number, y2: number) {
    const θ = calcAngle(x1, y1, x2, y2)
    if (θ >= -67.5 && θ < -22.5)
        return 0

    else if (θ >= -22.5 && θ < 22.5)
        return 7

    else if (θ >= 22.5 && θ < 67.5)
        return 3

    else if (θ >= 67.5 && θ < 112.5)
        return 6

    else if (θ >= 112.5 && θ < 157.5)
        return 2

    else if (θ >= -157.5 && θ < -112.5)
        return 1

    else if (θ >= -112.5 && θ < -67.5)
        return 4

    return 5
}

export function calcDirection4(x1: number, y1: number, x2: number, y2: number) {
    const θ = calcAngle(x1, y1, x2, y2)
    if (θ >= 0 && θ < 90)
        return 3

    else if (θ >= -90 && θ < 0)
        return 0

    else if (θ >= 90)
        return 2

    return 1
}
