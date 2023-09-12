<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { type ContainerInst } from 'vue3-pixi'
import { getCursor } from '~/core/cursor'

const cursorLayer = ref<ContainerInst>()

const cursor = await getCursor()

onMounted(() => {
    cursorLayer.value!.addChild(cursor)
})
</script>

<template>
    <Container ref="cursorLayer" />
</template>
