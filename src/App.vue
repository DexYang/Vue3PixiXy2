<script setup lang="ts">
import { Application } from 'vue3-pixi'
import { useFps, useTitle, useWindowSize } from '@vueuse/core'
import { Peer } from 'peerjs'
import { computed, ref } from 'vue'
import { useResourceState } from '~/states/modules/resource_state'
import { useScenesState } from '~/states/modules/scenes_state'
import { settings } from '~/settings'
import { components } from '~/scenes'
import { usePlayerState } from '~/states/modules/players_state'

const { width, height } = useWindowSize()

const { resourcesState, loadResource } = useResourceState()

const { scenesState } = useScenesState()

useTitle(settings.title)

const fps = useFps()

// const peer = new Peer()

// peer.on('open', (id) => {
//     console.log(`My peer ID is: ${id}`)
// })

const { login } = usePlayerState()
const map = ref('')

async function click() {
    await loadResource()
    await login('default')
}
</script>

<template>
    <div absolute text-white>
        fps: {{ fps }} {{ map }}
        <input class="bg-transparent border-0 focus:outline-0">
    </div>
    <div v-if="!resourcesState.isResourceLoaded" bg-dark h-100vh>
        <div class="window" w-360px h-100px relative m-auto top-25vh text-center>
            <div class="title-bar inactive">
                <img src="/ico.ico" w-16px h-16px>
                {{ settings.title }}
                <div class="title-bar-controls">
                    <button aria-label="Close" />
                </div>
            </div>
            <p mt-20px>
                由于浏览器限制, 请手动选择{{ settings.title }}官方目录
            </p>
            <button mt-10px @click="click">
                选择
            </button>
        </div>
    </div>

    <Application
        v-else
        :width="width"
        :height="height"
        :background="0x000000"
        event-mode="passive"
        :event-features="{
            move: true,
            globalMove: false,
            click: true,
            wheel: true,
        }">
        <AlphaTransition>
            <component :is="components[scenesState.current_scene]" />
        </AlphaTransition>
        <TipLayer />
        <CursorLayer />
    </Application>
</template>
