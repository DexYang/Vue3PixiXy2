import { defineAsyncComponent } from 'vue'

const components = {
    Start: defineAsyncComponent(() => import('./Start.vue')),
    Login: defineAsyncComponent(() => import('./Login.vue')),
    World: defineAsyncComponent(() => import('./World.vue'))
} as Record<string, any>

export interface IPortal {
    x: number
    y: number
    target: string
    targetX: number
    targetY: number
}

interface IScene {
    map_id: string
    portals: Array<object>
    npc: { [key: string]: any }
}

const scenes: Record<string, IScene> = {}

async function load() {
    const map_pool = import.meta.glob('./**/index.ts')
    const map_keys = Object.keys(map_pool)

    for (let i = 0; i < map_keys.length; i++) {
        const key = map_keys[i]
        const nameMatch = key.match(/^\.\/(.+)\/index\.ts/)
        if (!nameMatch)
            return
        const module: any = await map_pool[key]()
        scenes[nameMatch[1]] = {
            map_id: module.map_id,
            portals: module.portals ? module.portals : [],
            npc: {}
        }
    }

    const npc_pool = import.meta.glob('./**/npc/**.ts')
    const npc_keys = Object.keys(npc_pool)
    for (let i = 0; i < npc_keys.length; i++) {
        const key = npc_keys[i]
        const nameMatch = key.match(/^\.\/(.+)\/npc\/(.+)\.ts/)
        if (!nameMatch)
            return
        const module: any = await npc_pool[key]()
        scenes[nameMatch[1]]['npc'][nameMatch[2]] = module
    }
}

load()

export {
    components,
    scenes
}
