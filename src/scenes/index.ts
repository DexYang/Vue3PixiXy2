import { defineAsyncComponent } from 'vue'

const components = {
    Start: defineAsyncComponent(() => import('./Start.vue')),
    Login: defineAsyncComponent(() => import('./Login.vue')),
    World: defineAsyncComponent(() => import('./World.vue'))
} as Record<string, any>

interface IScene {
    map_id: string
    portals: Array<object>
    npc: { [key: string]: any }
}

const scenes: Record<string, IScene> = {}

const map_pool = import.meta.glob('./**/index.ts')

await Object.keys(map_pool).forEach(async (key) => {
    const nameMatch = key.match(/^\.\/(.+)\/index\.ts/)
    if (!nameMatch)
        return
    const module: any = await map_pool[key]()
    scenes[nameMatch[1]] = {
        map_id: module.map_id,
        portals: module.portals ? module.portals : [],
        npc: {}
    }
})

const npc_pool = import.meta.glob('./**/npc/**.ts')

await Object.keys(npc_pool).forEach(async (key) => {
    const nameMatch = key.match(/^\.\/(.+)\/npc\/(.+)\.ts/)
    if (!nameMatch)
        return
    const module: any = await npc_pool[key]()
    scenes[nameMatch[1]]['npc'][nameMatch[2]] = module
})

export {
    components,
    scenes
}
