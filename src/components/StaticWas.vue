<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import type { SpriteInst } from 'vue3-pixi'

import { WAS } from '~/lib/WAS'
import { useWDFManager } from '~/lib/WDFManager'

const props = withDefaults(defineProps<Props>(), {
    position: () => [0, 0],
    anchor: 0,
    zIndex: 0
})

const eleRef = ref<SpriteInst>()

interface Props {
    wdf: string
    pathHash: string
    anchor?: number | [number, number]
    position?: number | [number, number]
    zIndex?: number
}

const wdfManager = useWDFManager()

const texture = ref()
const loaded = ref(false)

onBeforeMount(async () => {
    if (loaded.value)
        return
    let was = await wdfManager.get(props.wdf, props.pathHash)
    if (was instanceof WAS) {
        texture.value = was.readFrames()[0][0].texture
        loaded.value = true
    }
    was = undefined
})
</script>

<template>
    <sprite
        v-if="loaded"
        ref="eleRef"
        :texture="texture"
        :anchor="anchor"
        :position="position"
        :z-index="zIndex" />
</template>
