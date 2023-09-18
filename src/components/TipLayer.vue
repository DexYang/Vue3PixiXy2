<script setup lang="ts">
import { Container } from 'pixi.js'
import { onMounted, ref } from 'vue'
import { type ContainerInst } from 'vue3-pixi'
import { useTipState } from '~/states/modules/tip_state'

const { tipsState } = useTipState()

const tipLayer = ref<ContainerInst>()

onMounted(async () => {
    console.log(tipLayer)
})
</script>

<template>
    <Container ref="tipLayer">
        <text
            v-for="(item, index) in tipsState"
            :key="index"
            :text="item.text"
            :style="{ fill: 'yellow' }" />
        <tip
            v-for="(item, index) in tipsState"
            :id="item.id"
            :key="index"
            :index="item.index"
            :text="item.text" />
    </Container>
</template>
