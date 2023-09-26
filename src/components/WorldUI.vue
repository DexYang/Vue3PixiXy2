<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core'
import { ref } from 'vue'
import type { ContainerInst } from 'vue3-pixi'
import { settings } from '~/settings'
import conf from '~/data/ui/world'

const res: any = conf[settings.ui_prefer]

const uiLayerRef = ref<ContainerInst>()

const { width, height } = useWindowSize()
</script>

<template>
    <Container ref="uiLayerRef" :x="0" :y="0">
        <static-was
            :res="res.static.坐标"
            :position="[0, 0]" />
        <static-was
            :res="res.static.人面板"
            :anchor="[1, 0]"
            :position="[width, 0]" />
        <static-was
            :res="res.static.头像框"
            :anchor="[1, 0]"
            :position="[width - 82, 0]" />
        <static-was
            :res="res.static.兽面板"
            :anchor="[1, 0]"
            :position="[width - 133, 0]" />
        <static-was
            :res="res.static.聊天框"
            :anchor="[0, 1]"
            :position="[0, height]" />
        <slot />
    </Container>
</template>
