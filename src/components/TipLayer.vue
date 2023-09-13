<script setup lang="ts">
import { Container } from 'pixi.js'
import { onMounted, ref } from 'vue'
import { type ContainerInst } from 'vue3-pixi'

const tipLayer = ref<ContainerInst>()

onMounted(async () => {
    console.log(tipLayer)
})
</script>

<template>
    <Container ref="tipLayer" />
</template>
