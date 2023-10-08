<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import type { ContainerInst } from 'vue3-pixi'
import { usePlayerState } from '~/states/modules/players_state'
import { scenes } from '~/scenes'

// import { useScenesState } from '~/states/modules/scenes_state'

// const { scenesState } = useScenesState()

const uiLayer = ref<ContainerInst>()

const { getPrimary } = usePlayerState()

const map_id = scenes[getPrimary.data.map].map_id
</script>

<template>
    <Container>
        <GameScene :key="map_id" :map-id="map_id" />
        <WorldUI ref="uiLayer" />
    </Container>
</template>
