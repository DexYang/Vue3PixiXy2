<script lang="ts" setup>
import type { Ref } from 'vue'
import { onMounted, ref, shallowRef } from 'vue'

import type { Frame } from '~/lib/WAS'
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

const textures = shallowRef<Array<Frame>>()
const loaded = ref(false)

const anchor: Ref<[number, number]> = ref([0, 0])

onMounted(async () => {
    if (loaded.value)
        return
    let was = await wdfManager.get(props.wdf, props.pathHash)
    if (was instanceof WAS) {
        textures.value = was.readFrames()[0]
        anchor.value = [was.x / was.width, was.y / was.height]
        loaded.value = true
    }
    was = undefined
})
</script>

<template>
    <!-- @vue-skip -->
    <animated-sprite
        v-if="loaded"
        :textures="textures"
        :update-anchor="true"
        :playing="true"
        :anchor="anchor"
        :position="position"
        :z-index="zIndex" />
</template>
