<script lang="ts" setup>
import conf from '~/data/login/start_scene'
import { settings } from '~/settings'

const res: any = conf[settings.ui_prefer]

function 进入游戏() {
    console.log('进入游戏 11')
}

function 注册账号() {
    console.log('注册账号 22')
}

const actions: Record<string, () => void> = { 进入游戏, 注册账号 }

function handle(name: string | number) {
    (actions[name] ?? (() => console.log('not found action')))()
}
</script>

<template>
    <LoginScene :conf="res">
        <ButtonWas
            v-for="(item, key) in res.buttons"
            :key="key"
            :wdf="item.wdf"
            :path-hash="item.was_hash"
            :position="[item.x, item.y]"
            @click="handle(key)" />
    </LoginScene>
</template>
