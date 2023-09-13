<script lang="ts" setup>
import type { PropType, Ref } from 'vue'
import { onBeforeMount, onMounted, ref } from 'vue'

import type { ContainerInst } from 'vue3-pixi'
import { WAS } from '~/lib/WAS'
import { WDFManager } from '~/lib/WDFManager'
import { settings } from '~/settings'

const props = defineProps({
    conf: {
        type: Object as PropType<Record<string, any>>,
        required: true
    }
})

const uiLayer = ref<ContainerInst>()

const res = props.conf[settings.ui_prefer]

const wdfManager = WDFManager.getInstance()

const staticList: Ref<Array<any>> = ref([])

const animationList: Ref<Array<any>> = ref([])

async function setup() {
    const staticListTemp = []
    for (const key in res.static) {
        const value = res.static[key]
        const was = await wdfManager.get(value.wdf, value.was_hash)
        if (was instanceof WAS) {
            value.was = was
            staticListTemp.push(value)
        }
    }
    staticList.value = staticListTemp
    const animationListTemp = []
    for (const key in res.animation) {
        const value = res.animation[key]
        const was = await wdfManager.get(value.wdf, value.was_hash)
        if (was instanceof WAS) {
            value.was = was
            animationListTemp.push(value)
        }
    }
    animationList.value = animationListTemp
}

onMounted(async () => {
    await setup()
})
</script>

<template>
    <Container ref="uiLayer" :z-index="100" :sortable-children="true">
        <sprite
            v-for="(item, index) in staticList"
            :key="index"
            :texture="item.was.readFrames()[0][0].texture"
            :anchor="0"
            :position="[item.x, item.y]"
            :z-index="item.z" />
        <animated-sprite
            v-for="(item, index) in animationList"
            :key="index"
            :textures="item.was.readFrames()[0]"
            update-anchor
            playing
            :anchor="[item.was.x / item.was.width, item.was.y / item.was.height]"
            :position="[item.x, item.y]"
            :z-index="item.z" />
        <slot />
    </Container>
</template>
