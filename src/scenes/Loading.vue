<template>
    <text ref="textRef" :anchor="0.5" :x="240" :y="240" :style="{ fill: 'green' }">
        @@@
    </text>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const textRef = ref()

onMounted(() => {
    console.log(textRef.value)
})
</script>
