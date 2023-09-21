<script lang="ts" setup>
import type { PropType } from 'vue'
import { onMounted, ref } from 'vue'
import type { ContainerInst } from 'vue3-pixi/global'
import { getRichText } from '~/core/rich_text'

const props = defineProps({
    text: {
        type: String as PropType<string>,
        required: true
    },
    width: {
        type: Number as PropType<number>,
        default: 100
    },
    x: {
        type: Number as PropType<number>,
        default: 0
    },
    y: {
        type: Number as PropType<number>,
        default: 0
    }
})

const containerRef = ref<ContainerInst>()

onMounted(async () => {
    const children = await getRichText(`#Y${props.text}`, props.width)
    containerRef.value!.addChild(...children)
    console.log(containerRef.value)
})
</script>

<template>
    <Container ref="containerRef" :x="props.x" :y="props.y" />
</template>
