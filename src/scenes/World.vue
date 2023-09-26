<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { ContainerInst } from 'vue3-pixi'

// import { useScenesState } from '~/states/modules/scenes_state'

// const { scenesState } = useScenesState()

const uiLayer = ref<ContainerInst>()

// const windowLayer = ref<ContainerInst>()

onMounted(() => {
    console.log(uiLayer.value)
})
</script>

<template>
    <Container>
        <GameScene map-id="newscene/1410.map" />
        <WorldUI ref="uiLayer" />
    </Container>
</template>
