<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core'
import { computed, ref } from 'vue'
import type { ContainerInst } from 'vue3-pixi'
import { External } from 'vue3-pixi'
import { settings } from '~/settings'
import conf from '~/data/ui/world'

const res: any = conf[settings.ui_prefer]

const uiLayerRef = ref<ContainerInst>()

const { width, height } = useWindowSize()

const inputValue = ref('')

function 成就() {
    console.log('World')
}

function 宝宝() {
    console.log('Start1')
}

function 道具() {
    console.log('离开 22')
}

function 组队() {
    console.log('离开 22')
}

function 攻击() {
    console.log('离开 22')
}

function 给予() {
    console.log('离开 22')
}

function 交易() {
    console.log('离开 22')
}

function 坐骑() {
    console.log('离开 22')
}

function 宠物() {
    console.log('离开 22')
}

function 技能() {
    console.log('离开 22')
}

function 任务() {
    console.log('离开 22')
}
function 好友() {
    console.log('离开 22')
}

function 帮派() {
    console.log('离开 22')
}

function 系统() {
    console.log('离开 22')
}

const actions: Record<string, () => void> = { 成就, 宝宝, 道具, 组队, 攻击, 给予, 交易, 坐骑, 宠物, 技能, 任务, 好友, 帮派, 系统 }

function handle(name: string | number) {
    (actions[name] ?? (() => console.log('not found action')))()
}

const chatFrameWidth = computed(() => width.value - 420)
const inputWidth = computed(() => `width: ${chatFrameWidth.value - 50}px`)
</script>

<template>
    <Container ref="uiLayerRef" :x="0" :y="0">
        <static-was
            :res="res.static.坐标"
            :position="[0, 0]" />
        <static-was
            :res="res.static.人面板"
            :anchor="[1, 0]"
            :position="[width, 0]" />
        <static-was
            :res="res.static.头像框"
            :anchor="[1, 0]"
            :position="[width - 82, 0]" />
        <static-was
            :res="res.static.兽面板"
            :anchor="[1, 0]"
            :position="[width - 133, 0]" />
        <nine-slice
            :res="res.static.聊天框"
            :position="[0, height - 26]"
            :width="chatFrameWidth"
            :height="25"
            :top="25"
            :left="100"
            :right="100"
            :bottom="0">
            <External tag="div" class="absolute! left-50px bottom-0 m-0 p-0">
                <input v-model="inputValue" class="bg-transparent border-0 focus:outline-0 font-sans text-white h-26px" :style="inputWidth">
            </External>
        </nine-slice>
        <ButtonWas
            v-for="(item, key) in res.buttons"
            :key="key"
            :wdf="item.wdf"
            :path-hash="item.was_hash"
            :anchor="[1, 1]"
            :position="[width - item.x, height]"
            @click="handle(key)" />
        <slot />
    </Container>
</template>
