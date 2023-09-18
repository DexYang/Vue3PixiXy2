<script lang="ts" setup>
import conf from '~/data/login/start_scene'
import { settings } from '~/settings'
import { useScenesState } from '~/states/modules/scenes_state'
import { useTipState } from '~/states/modules/tip_state'

const res: any = conf[settings.ui_prefer]

const { switchScene, scenesState } = useScenesState()

const { notify } = useTipState()

function 进入游戏() {
    switchScene('Login')
}

function 注册账号() {
    notify('啊啊啊啊啊啊啊')
}

function 退出游戏() {

}

const actions: Record<string, () => void> = { 进入游戏, 注册账号, 退出游戏 }

function handle(name: string | number) {
    (actions[name] ?? (() => console.log('not found action')))()
}
</script>

<template>
    <LoginScene v-if="scenesState.current_scene === 'Start'" :conf="res">
        <ButtonWas
            v-for="(item, key) in res.buttons"
            :key="key"
            :wdf="item.wdf"
            :path-hash="item.was_hash"
            :position="[item.x, item.y]"
            @click="handle(key)" />
    </LoginScene>
</template>
