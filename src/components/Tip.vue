<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core'
import { Texture } from 'pixi.js'
import { onMounted, ref, shallowRef } from 'vue'
import type { NineSliceInst } from 'vue3-pixi'
import data from '~/data/common'
import { useWDFManager } from '~/lib/WDFManager'

interface Props {
    text?: string
    x?: number
    y?: number
}

const props = withDefaults(defineProps<Props>(), {
    text: '',
    x: 0,
    y: 0
})

const tipWidth = ref(360)
const tipHeight = ref(60)

const { width, height } = useWindowSize()

const eleRef = ref<NineSliceInst>()

const wdfManager = useWDFManager()

const texture = shallowRef()
const loaded = ref(false)

onMounted(async () => {
    if (loaded.value)
        return
    let tex = await wdfManager.get(data.tip[0], data.tip[1])
    if (tex instanceof Texture) {
        texture.value = tex
        loaded.value = true
    }
    tex = undefined
})
</script>

<template>
    <nine-slice-plane
        v-if="loaded"
        ref="eleRef"
        :texture="texture"
        :width="tipWidth"
        :height="tipHeight"
        :left-width="20"
        :top-height="20"
        :right-width="20"
        :bottom-height="20"
        :position="[(width - tipWidth) / 2 + x, (height - tipHeight) / 2 + y]">
        <text :style="{ fill: 'Yellow' }">
            {{ props.text }}
        </text>
    </nine-slice-plane>
</template>