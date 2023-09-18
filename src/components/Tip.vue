<script lang="ts" setup>
import { onBeforeMount, ref, shallowRef } from 'vue'
import type { NineSliceInst } from 'vue3-pixi'
import data from '~/data/common'
import { WAS } from '~/lib/WAS'
import { useWDFManager } from '~/lib/WDFManager'

const props = withDefaults(defineProps<Props>(), {
    text: '',
    position: () => [0, 0]
})

const tipWidth = ref(360)
const tipHeight = ref(50)

const eleRef = ref<NineSliceInst>()

interface Props {
    text?: string
    position?: number | [number, number]
}

const wdfManager = useWDFManager()

const texture = shallowRef()
const loaded = ref(false)

onBeforeMount(async () => {
    if (loaded.value)
        return
    let was = await wdfManager.get(data.tip[0], data.tip[1])
    if (was instanceof WAS) {
        texture.value = was.readFrames()[0][0].texture
        loaded.value = true
    }
    was = undefined
})
</script>

<template>
    <nine-slice-plane
        v-if="loaded"
        ref="eleRef"
        :texture="texture"
        :width="tipWidth"
        :height="tipHeight"
        :left-width="10"
        :top-height="10"
        :right-width="10"
        :bottom-height="10"
        :position="position">
        <text style="{ fill: 'Yellow'}">
            {{ text }}
        </text>
    </nine-slice-plane>
</template>
