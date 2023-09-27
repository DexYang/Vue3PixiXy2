<script lang="ts" setup>
import { Texture } from 'pixi.js'
import { onMounted, ref, shallowRef } from 'vue'
import type { NineSliceInst } from 'vue3-pixi'
import { WAS } from '~/lib/WAS'
import { useWDFManager } from '~/lib/WDFManager'

const props = withDefaults(defineProps<Props>(), {
    position: () => [0, 0],
    width: 0,
    height: 0,
    top: 20,
    left: 20,
    right: 20,
    bottom: 20
})

interface Props {
    res?: { wdf: string; was_hash: string }
    wdf?: string
    pathHash?: string
    position?: number | [number, number]
    width?: number
    height?: number
    top?: number
    left?: number
    right?: number
    bottom?: number
}

const eleRef = ref<NineSliceInst>()

const wdfManager = useWDFManager()

const texture = shallowRef()
const loaded = ref(false)

onMounted(async () => {
    if (loaded.value)
        return

    let item
    if (props.res)
        item = await wdfManager.get(props.res.wdf, props.res.was_hash)
    else if (props.wdf && props.pathHash)
        item = await wdfManager.get(props.wdf, props.pathHash)

    if (item instanceof WAS) {
        texture.value = item.readFrames()[0][0].texture
        loaded.value = true
    }
    else if (item instanceof Texture) {
        texture.value = item
        loaded.value = true
    }
    item = undefined
})
</script>

<template>
    <nine-slice-plane
        v-if="loaded"
        ref="eleRef"
        :texture="texture"
        :width="props.width"
        :height="props.height"
        :left-width="props.left"
        :top-height="props.top"
        :right-width="props.right"
        :bottom-height="props.bottom"
        :position="props.position">
        <slot />
    </nine-slice-plane>
</template>
