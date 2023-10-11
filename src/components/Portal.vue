<script lang="ts" setup>
import type { Ref } from 'vue'
import { nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { Frame } from '~/lib/WAS'
import { WAS } from '~/lib/WAS'
import { useWDFManager } from '~/lib/WDFManager'
import { usePlayerState } from '~/states/modules/players_state'
import type { IPortal } from '~/scenes'

const props = defineProps<IPortal>()

const usePlayerStateSetup = usePlayerState()
const { getPrimary } = storeToRefs(usePlayerStateSetup)

watch(() => getPrimary.value.data.x, () => {
    const _x = getPrimary.value.data.x
    const _y = getPrimary.value.data.y
    if (Math.abs(props.x - _x) < 10 && Math.abs(props.y - _y) < 10) {
        getPrimary.value.data.map = props.target
        getPrimary.value.reset()
        getPrimary.value.position.set(props.targetX, props.targetY)
    }
})
</script>

<template>
    <animated-was
        :position="[props.x, props.y]"
        wdf="mapani.wdf"
        path-hash="change_point.tcp"
        event-mode="none" />
</template>
