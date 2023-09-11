<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const containerRef = ref()
onMounted(() => {
    containerRef.value.position = { x: 120, y: 80 }
})
</script>

<template>
    <container ref="containerRef">
        <text text="Hello" />
        <text text="World" />
    </container>
</template>
