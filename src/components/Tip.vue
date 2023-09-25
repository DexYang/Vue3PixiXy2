<script lang="ts" setup>
import { useMouse, useWindowSize } from '@vueuse/core'
import { Texture } from 'pixi.js'
import { onMounted, ref, shallowRef, watch } from 'vue'
import type { NineSliceInst } from 'vue3-pixi'
import data from '~/data/common'
import { useWDFManager } from '~/lib/WDFManager'
import { useTipState } from '~/states/modules/tip_state'

interface Props {
    text: string
    x: number
    y: number
    id: string
    index: number
}

const props = withDefaults(defineProps<Props>(), {
    text: '',
    x: 0,
    y: 0
})

const tipWidth = ref(360)
const tipHeight = ref(60)

const { width, height } = useWindowSize()

const { remove } = useTipState()

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

function updateWH(obj: { width: number; height: number }) {
    tipWidth.value = Math.max(obj.width + 40, 360)
    tipHeight.value = Math.max(obj.height + 20, 60)
}

const { x, y } = useMouse()
const pressed = ref(false)

const init_x = ref(0)
const init_y = ref(0)
const delta_x = ref(0)
const delta_y = ref(0)

watch(x, () => {
    if (pressed.value) {
        delta_x.value = x.value - init_x.value
        delta_y.value = y.value - init_y.value
    }
})

function onDrag() {
    pressed.value = true
    init_x.value = x.value
    init_y.value = y.value
}

function onClick() {
    pressed.value = false
    remove(props.index, props.id)
}
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
        :position="[(width - tipWidth) / 2 + props.x + delta_x, (height - tipHeight) / 2 + props.y + delta_y]"
        @pointerdown="onDrag()"
        @click="onClick()">
        <rich-text :text="props.text" :width="320" :x="20" :y="10" @update="updateWH" />
    </nine-slice-plane>
</template>
