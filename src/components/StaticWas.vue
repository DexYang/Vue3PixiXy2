<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import { WAS } from '~/lib/WAS'
import { useWDFManager } from '~/lib/WDFManager'

interface Props {
    wdf: string
    pathHash: string
    anchor?: number | [number, number]
    position?: number | [number, number]
    zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    position: () => [0, 0],
    anchor: 0,
    zIndex: 0
})

const wdfManager = useWDFManager()

const texture = ref()

onMounted(async () => {
    const was = await wdfManager.get(props.wdf, props.pathHash)
    if (was instanceof WAS)
        texture.value = was.readFrames()[0][0].texture
})
</script>

<template>
    <sprite
        v-if="texture"
        :texture="texture"
        :anchor="anchor"
        :position="position"
        :z-index="zIndex" />
</template>
