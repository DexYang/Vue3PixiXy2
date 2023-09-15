<script lang="ts" setup>
import { Sprite } from 'pixi.js'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useSoundManager } from '~/lib/SoundManager'
import { WAS } from '~/lib/WAS'
import { useWDFManager } from '~/lib/WDFManager'
import sounds from '~/data/sound'

interface Props {
    wdf: string
    pathHash: string
    anchor?: number | [number, number]
    position?: number | [number, number]
    zIndex?: number
    text?: string
    padding?: number
}

const props = withDefaults(defineProps<Props>(), {
    position: () => [0, 0],
    anchor: 0,
    zIndex: 100
})

const emit = defineEmits(['click'])

const wdfManager = useWDFManager()

const sndManager = useSoundManager()

const fbRef = ref()

const defaultView = ref()
const pressedView = ref()
const hoverView = ref()

const buttonDown = sounds.button_down

onMounted(async () => {
    let was = await wdfManager.get(props.wdf, props.pathHash)
    if (was instanceof WAS) {
        defaultView.value = new Sprite(was.readFrames()[0][0].texture)
        pressedView.value = new Sprite(was.readFrames()[0][1].texture)
        hoverView.value = new Sprite(was.readFrames()[0][2].texture)
    }
    was = undefined
    fbRef.value!.onPress.connect(async () => {
        await emit('click')
    })
})

onBeforeUnmount(() => {
    fbRef.value!.destroy(true)
})
</script>

<template>
    <fancy-button
        ref="fbRef"
        :default-view="defaultView"
        :pressed-view="pressedView"
        :hover-view="hoverView"
        :anchor="anchor"
        :position="position"
        :text="text"
        :padding="padding"
        :z-index="zIndex"
        :down="() => sndManager.play(buttonDown[0], buttonDown[1], false, true)" />
</template>
