<script lang="ts" setup>
import { onBeforeMount, ref, shallowRef } from 'vue'
import type { SpriteInst } from 'vue3-pixi'

import { WAS } from '~/lib/WAS'
import { useWDFManager } from '~/lib/WDFManager'

const props = withDefaults(defineProps<Props>(), {
    position: () => [0, 0],
    anchor: 0,
    zIndex: 0,
    width: 0
})

const eleRef = ref<SpriteInst>()

interface Props {
    res?: { wdf: string; was_hash: string }
    wdf?: string
    pathHash?: string
    anchor?: number | [number, number]
    position?: number | [number, number]
    zIndex?: number
    width?: number
}

const wdfManager = useWDFManager()

const texture = shallowRef()
const loaded = ref(false)

onBeforeMount(async () => {
    if (loaded.value)
        return
    let was
    if (props.res)
        was = await wdfManager.get(props.res.wdf, props.res.was_hash)
    else if (props.wdf && props.pathHash)
        was = await wdfManager.get(props.wdf, props.pathHash)
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
        :z-index="zIndex">
        <slot />
    </sprite>
</template>
