<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, onMounted, ref } from 'vue'
import type { ContainerInst } from 'vue3-pixi'
import { onTick, useApplication } from 'vue3-pixi'
import { Viewport } from 'pixi-viewport'
import type { FederatedPointerEvent } from 'pixi.js'
import { Sprite } from 'pixi.js'
import { useWindowSize } from '@vueuse/core'
import type { MapX } from '~/lib/MapX'
import { getMapX } from '~/lib/MapX'
import type { Character } from '~/core/character'
import { getCharacter } from '~/core/character'

const props = defineProps({
    mapId: {
        type: String as PropType<string>,
        required: true
    }
})

const viewportRef = ref<Viewport>()
const mapLayer = ref<ContainerInst>()
const shapeLayer = ref<ContainerInst>()

const app = useApplication()

const mapx = ref<MapX>()

const worldWidth = computed(() => mapx.value?.width)
const worldHeight = computed(() => mapx.value?.height)

const player = ref<Character>()

const loaded = ref(false)

const { width, height } = useWindowSize()

function onMapRightClick(event: FederatedPointerEvent) {
    const path = mapx.value!.path_find(
        player.value!.position._x,
        player.value!.position._y,
        viewportRef.value!.left + event.x,
        viewportRef.value!.top + event.y
    )
    player.value!.setNewTarget(path, true)
}

function updateWindow() {
    if (!loaded.value)
        return
    const { start_col, end_col, start_row, end_row } = getWindow()
    for (let i = start_row; i <= end_row; i++) {
        for (let j = start_col; j <= end_col; j++) {
            const block_index = i * mapx.value!.col_num + j
            const block = mapx.value!.blocks[block_index]
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
    const x = player.value!.position.x
    const y = player.value!.position.y
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

onMounted(async () => {
    player.value = await getCharacter(1)
    player.value.position.set(800, 800)

    mapx.value = await getMapX(props.mapId)
    viewportRef.value!.clamp({
        direction: 'all',
        underflow: 'center'
    })
    viewportRef.value!.follow(player.value)
    viewportRef.value!.resize()

    shapeLayer.value!.addChild(player.value)

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
        <Container
            ref="shapeLayer"
            :alpha="1"
            :use-double-buffer="true"
            :sortable-children="true" />
    </Viewport>
</template>
