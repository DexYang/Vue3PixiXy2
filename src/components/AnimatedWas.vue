<script lang="ts" setup>
import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'
import { WAS } from '~/lib/WAS'
import { useWDFManager } from '~/lib/WDFManager'

interface Props {
    wdf: string
    pathHash: string
    position?: number | [number, number]
    zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    position: () => [0, 0],
    zIndex: 0
})

const wdfManager = useWDFManager()

const textures = ref()

const anchor: Ref<[number, number]> = ref([0, 0])

onMounted(async () => {
    const was = await wdfManager.get(props.wdf, props.pathHash)
    if (was instanceof WAS) {
        textures.value = was.readFrames()[0]
        anchor.value = [was.x / was.width, was.y / was.height]
    }
})
</script>

<template>
    <!-- @vue-skip -->
    <animated-sprite
        v-if="textures"
        :textures="textures"
        :update-anchor="true"
        :playing="true"
        :anchor="anchor"
        :position="position"
        :z-index="zIndex" />
</template>
