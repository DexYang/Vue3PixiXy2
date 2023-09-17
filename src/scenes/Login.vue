<script lang="ts" setup>
import conf from '~/data/login/login_scene'
import { settings } from '~/settings'
import { useScenesState } from '~/states/modules/scenes_state'

const res: any = conf[settings.ui_prefer]

const { switchScene, scenesState } = useScenesState()

function 登录() {
    switchScene('World')
}

function 取消() {
    switchScene('Start')
}

function 离开() {
    console.log('离开 22')
}

const actions: Record<string, () => void> = { 登录, 取消, 离开 }

function handle(name: string | number) {
    (actions[name] ?? (() => console.log('not found action')))()
}
</script>

<template>
    <LoginScene v-if="scenesState.current_scene === 'Login'" :conf="res">
        <ButtonWas
            v-for="(item, key) in res.buttons"
            :key="key"
            :wdf="item.wdf"
            :path-hash="item.was_hash"
            :position="[item.x, item.y]"
            @click="handle(key)" />
    </LoginScene>
</template>
