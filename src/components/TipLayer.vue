<script setup lang="ts">
import { Container } from 'pixi.js'
import { ref } from 'vue'
import { type ContainerInst } from 'vue3-pixi'
import Tip from './Tip.vue'
import { useTipState } from '~/states/modules/tip_state'

const { tipsState } = useTipState()

const tipLayer = ref<ContainerInst>()
</script>

<template>
    <Container ref="tipLayer">
        <Tip
            v-for="(item, index) in tipsState"
            :id="item.id"
            :key="index"
            :index="item.index"
            :text="item.text"
            :x="item.x"
            :y="item.y" />
    </Container>
</template>
