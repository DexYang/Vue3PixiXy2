<script setup lang="ts">
import { Text } from 'pixi.js'
import { onMounted, ref } from 'vue'
import type { ContainerInst } from 'vue3-pixi'

const cursorLayer = ref<ContainerInst>()

onMounted(() => {
    console.log(cursorLayer.value)
    cursorLayer.value!.addChild(new Text('???', { fill: 'white' }))
})
</script>

<template>
    <Container ref="cursorLayer">
        <text :anchor="0.5" :x="120" :y="120" :style="{ fill: 'white' }">
            Hello World
        </text>
    </Container>
</template>
