<script setup lang="ts">
import { Application } from 'vue3-pixi'
import { useWindowSize } from '@vueuse/core'

const { width, height } = useWindowSize()
</script>

<template>
    <Application :width="width" :height="height">
        <CursorLayer />
        <TipLayer />
        <router-view />
    </Application>
</template>
