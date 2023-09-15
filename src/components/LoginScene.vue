<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core'
import type { PropType } from 'vue'
import { computed, onBeforeUnmount, ref } from 'vue'

import type { ContainerInst } from 'vue3-pixi/global'

const props = defineProps({
    conf: {
        type: Object as PropType<Record<string, any>>,
        required: true
    },
    width: {
        type: Number as PropType<number>,
        default: 640
    },
    height: {
        type: Number as PropType<number>,
        default: 480
    }
})

const containerRef = ref<ContainerInst>()

const { width, height } = useWindowSize()

const x = computed(() => Math.max((width.value - props.width) / 2, 0))
const y = computed(() => Math.max((height.value - props.height) / 2, 0))

onBeforeUnmount(() => {
    containerRef.value!.destroy(true)
})
</script>

<template>
    <Container ref="containerRef" :z-index="100" :sortable-children="true" :x="x" :y="y">
        <static-was
            v-for="(item, index) in conf.static"
            :key="index"
            :wdf="item.wdf"
            :path-hash="item.was_hash"
            :position="[item.x, item.y]"
            :z-index="item.z" />
        <animated-was
            v-for="(item, index) in conf.animation"
            :key="index"
            :wdf="item.wdf"
            :path-hash="item.was_hash"
            :position="[item.x, item.y]"
            :z-index="item.z" />
        <slot />
    </Container>
</template>
