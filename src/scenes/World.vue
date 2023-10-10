<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue'
import type { ContainerInst } from 'vue3-pixi'
import { storeToRefs } from 'pinia'
import { usePlayerState } from '~/states/modules/players_state'
import { scenes } from '~/scenes'

// import { useScenesState } from '~/states/modules/scenes_state'

// const { scenesState } = useScenesState()

const uiLayer = ref<ContainerInst>()

const usePlayerStateSetup = usePlayerState()
const { getPrimary } = storeToRefs(usePlayerStateSetup)

const map_id = computed(() => scenes[getPrimary.value.data.map].map_id)
const portals = computed(() => scenes[getPrimary.value.data.map].portals)
</script>

<template>
    <Container>
        <GameScene :key="map_id" :map-id="map_id" :portals="portals" />
        <WorldUI ref="uiLayer" />
    </Container>
</template>
