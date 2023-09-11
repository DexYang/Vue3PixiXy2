<script setup lang="ts">
import { Text } from 'pixi.js'
import type { Layer as PixiLayer } from '@pixi/layers'
import { onMounted, ref } from 'vue'
import { useApplication } from 'vue3-pixi'

const cursorLayer = ref<PixiLayer>()

const app = useApplication()

onMounted(() => {
    console.log(cursorLayer.value)
    cursorLayer.value!.addChild(new Text('???', { fill: 'white' }))
})
</script>

<template>
    <Viewport ref="cursorLayer" :worl-width="800" :world-height="600" :events="app.renderer.events">
        <text :anchor="0.5" :x="120" :y="120" :style="{ fill: 'white' }">
            Hello World
        </text>
    </Viewport>
</template>
