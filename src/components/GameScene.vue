<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { ContainerInst } from 'vue3-pixi'
import { onTick, useApplication } from 'vue3-pixi'
import { Viewport } from 'pixi-viewport'
import type { FederatedPointerEvent } from 'pixi.js'
import { Sprite } from 'pixi.js'
import { useWindowSize } from '@vueuse/core'
import { usePeerState } from '~/states/modules/peer_state'
import type { MapX } from '~/lib/MapX'
import { getMapX } from '~/lib/MapX'
import { usePlayerState } from '~/states/modules/players_state'

const props = defineProps({
    mapId: {
        type: String as PropType<string>,
        required: true
    },
    portals: {
        type: Array<any>,
        default: []
    }
})
const viewportRef = ref<Viewport>()
const mapLayer = ref<ContainerInst>()
const shapeLayer = ref<ContainerInst>()

const app = useApplication()
const { width, height } = useWindowSize()

const mapx = shallowRef<MapX>()
const worldWidth = computed(() => mapx.value?.width)
const worldHeight = computed(() => mapx.value?.height)

const loaded = ref(false)

const usePlayerStateSetup = usePlayerState()
const { getPrimary, getPlayers } = storeToRefs(usePlayerStateSetup)

const primaryPlayer = getPrimary

const { broadcast } = usePeerState()

function onMapRightClick(event: FederatedPointerEvent) {
    queueMicrotask(() => {
        const path = mapx.value!.path_find(
            primaryPlayer.value.data.x,
            primaryPlayer.value.data.y,
            viewportRef.value!.left + event.x,
            viewportRef.value!.top + event.y
        )
        primaryPlayer.value!.setNewTarget(path, true)
        broadcast({
            type: 'path',
            path,
            id: primaryPlayer.value.data.id,
            running: true
        })
    })
}

function updateWindow() {
    if (!loaded.value)
        return
    const { start_col, end_col, start_row, end_row } = getWindow()
    const max_col = Math.min(end_col, mapx.value!.col_num - 1)
    const max_row = Math.min(end_row, mapx.value!.row_num - 1)
    for (let i = start_row; i <= max_row; i++) {
        for (let j = start_col; j <= max_col; j++) {
            const block_index = i * mapx.value!.col_num + j
            const block = mapx.value!.blocks[block_index]
            if (block_index >= mapx.value.block_num)
                continue
            if (!block.requested) {
                mapx.value!.getJpeg(block_index)
            }
            else if (block.texture) {
                const block_sprite = new Sprite(block.texture)
                block_sprite.position.x = j * 320
                block_sprite.position.y = i * 240
                block_sprite.zIndex = 0
                mapLayer.value!.addChild(block_sprite)
                block.texture = null
                block.loaded = true
            }

            for (let k = 0; k < block.ownMasks.length; k++) {
                const maskIndex = block.ownMasks[k]
                const mask = mapx.value!.masks[maskIndex]
                if (!mask.requested) {
                    mapx.value!.getMask(maskIndex)
                }
                else if (mask.texture) {
                    const mask_sprite = new Sprite(mask.texture)
                    mask_sprite.position.x = mask.x
                    mask_sprite.position.y = mask.y
                    mask_sprite.zIndex = mask.z
                    mask_sprite.eventMode = 'none'
                    shapeLayer.value!.addChild(mask_sprite)
                    mask.texture = null
                    mask.loaded = true
                }
            }
        }
    }
}

function getWindow() {
    const x = primaryPlayer.value.data.x
    const y = primaryPlayer.value.data.y
    const innerWidth = window.innerWidth
    const innerHeight = window.innerHeight

    const halfWidth = Math.floor(innerWidth / 2)
    const halfHeight = Math.floor(innerHeight / 2)

    const left = Math.min(Math.max(x - halfWidth, 0), mapx.value!.width - innerWidth)
    const top = Math.min(Math.max(y - halfHeight, 0), mapx.value!.height - halfHeight)

    const start_col = Math.max(Math.floor(left / 320), 0)
    const window_cols = Math.ceil(innerWidth / 320)
    const end_col = Math.min(start_col + window_cols, mapx.value!.col_num)

    const start_row = Math.max(Math.floor(top / 240), 0)
    const window_rows = Math.ceil(innerHeight / 240)
    const end_row = Math.min(start_row + window_rows, mapx.value!.row_num)

    return { left, top, start_col, end_col, start_row, end_row }
}

onTick(() => updateWindow())

const currentPlayers: Set<string> = new Set()

watch(getPlayers, () => {
    const temp = {}
    currentPlayers.forEach(key => temp[key] = true)

    currentPlayers.clear()
    getPlayers.value.forEach((item) => {
        currentPlayers.add(item.name)
        if (item.name in temp) // 已存在的player，跳过
            temp[item.name] = false
        else if (shapeLayer.value) // 新player
            shapeLayer.value!.addChild(item)
    })

    Object.keys(temp).forEach((key) => {
        if (temp[key]) {
            const child = shapeLayer.value!.getChildByName(key, false)
            shapeLayer.value!.removeChild(child)
        }
    })
})

watch(primaryPlayer, () => {
    viewportRef.value!.follow(primaryPlayer.value!)
})

onMounted(async () => {
    mapx.value = await getMapX(props.mapId)
    viewportRef.value!.clamp({
        direction: 'all',
        underflow: 'center'
    })

    viewportRef.value!.follow(primaryPlayer.value!)
    viewportRef.value!.resize()

    currentPlayers.clear()

    getPlayers.value.forEach((item) => {
        shapeLayer.value!.addChild(item)
        currentPlayers.add(item.name)
    })

    shapeLayer.value.on('sort', (item) => {
        if (item instanceof Character) {
            item.zIndex = item.y
            const block_index = Math.floor(item.y / 240) * mapx.value.col_num + Math.floor(item.x / 320)
            const ownMasks = mapx.value.blocks[block_index].ownMasks

            for (let i = 0; i < ownMasks.length; i++) {
                const mask = mapx.value.masks[ownMasks[i]]
                if (mask.calc_sort_z(item.x, item.y)) {
                    item.zIndex = Math.max(item.zIndex, mask.z + 1)
                    item.zOrder = item.zIndex
                }
            }
        }
        else {
            item.zIndex = item.y
        }
    })

    loaded.value = true
})
</script>

<template>
    <Viewport
        ref="viewportRef"
        :screen-width="width"
        :screen-height="height"
        :world-width="worldWidth"
        :world-height="worldHeight"
        :events="app.renderer.events"
        :dirty="true">
        <Container
            ref="mapLayer"
            event-mode="static"
            @right-click="onMapRightClick" />
        <Portal
            v-for="(item, index) in props.portals"
            :key="index"
            :x="item.x"
            :y="item.y"
            :target="item.target"
            :target-x="item.targetX"
            :target-y="item.targetY" />
        <Container
            ref="shapeLayer"
            :alpha="1"
            :use-double-buffer="true"
            :sortable-children="true" />
    </Viewport>
</template>
