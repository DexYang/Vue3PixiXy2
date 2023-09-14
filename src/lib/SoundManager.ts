import { Sound } from '@pixi/sound'
import type { WDFManager } from '~/lib/WDFManager'
import { useWDFManager } from '~/lib/WDFManager'

export class SoundManager {
    private static instance: SoundManager

    wdfManager: WDFManager

    sounds: Map<string, Sound>

    bgm: Sound | undefined

    public static getInstance() {
        if (!SoundManager.instance)
            SoundManager.instance = new SoundManager()

        return SoundManager.instance
    }

    constructor() {
        this.wdfManager = useWDFManager()
        this.sounds = new Map<string, Sound>()
    }

    async play(wdf: string, path: string, loop = false, load = false) {
        if (load && this.sounds.has(wdf + path)) {
            const sound = this.sounds.get(wdf + path)
            sound!.play({ loop })
            return sound
        }
        const data = await this.wdfManager.get(wdf, path)
        if (data && data instanceof ArrayBuffer) {
            const sound = Sound.from(data)
            if (load)
                this.sounds.set(wdf + path, sound)

            sound.play({ loop })
            return sound
        }
        return undefined
    }

    async bgmPlay(wdf: string, path: string) {
        this.bgmStop()
        this.bgm = await this.play(wdf, path, true)
    }

    bgmStop() {
        if (this.bgm instanceof Sound)
            this.bgm.stop()
    }
}

export function useSoundManager(): SoundManager {
    return SoundManager.getInstance()
}
