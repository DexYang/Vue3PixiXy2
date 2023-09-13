<script setup lang="ts">
import { Container } from 'pixi.js'
import { onMounted, ref } from 'vue'
import { type ContainerInst } from 'vue3-pixi'

import { getCursor } from '~/core/cursor'

const cursorLayer = ref<ContainerInst>()

onMounted(async () => {
    const cursor = await getCursor()
    cursorLayer.value!.addChild(cursor)
})
</script>

<template>
    <Container ref="cursorLayer" :z-index="99999" />
</template>
