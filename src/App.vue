<script setup lang="ts">
import { Application } from 'vue3-pixi'
import { useTitle, useWindowSize } from '@vueuse/core'
import { useResourceState } from '~/states/modules/resource_state'
import { settings } from '~/settings'
import scenes from '~/scenes'

const { width, height } = useWindowSize()

const { resourcesState, loadResource } = useResourceState()

async function onClickLoad() {
    await loadResource()
    resourcesState.isResourceLoaded = true
}

useTitle(settings.title)
</script>

<template>
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
            <button mt-10px @click="onClickLoad()">
                选择
            </button>
        </div>
    </div>
    <Application v-else :width="width" :height="height" :background="0x222222">
        <component :is="scenes.Start" />
        <!-- <TipLayer /> -->
        <CursorLayer />
    </Application>
</template>
