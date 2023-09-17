<script lang="ts" setup>
import { useScenesState } from '~/states/modules/scenes_state'

const { scenesState } = useScenesState()
</script>

<template>
    <GameScene
        v-if="scenesState.current_scene === 'World'"
        map-id="newscene/1410.map" />
</template>
