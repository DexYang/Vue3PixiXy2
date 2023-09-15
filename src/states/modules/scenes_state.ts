import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref } from 'vue'

interface IScenesState {
    current_scene: string
}

export const useScenesState = defineStore('scenes', () => {
    const scenesState: Ref<IScenesState> = ref({
        current_scene: 'Start'
    })

    const switchScene = async (scene: string) => {
        scenesState.value.current_scene = scene
    }

    return {
        scenesState,
        switchScene
    }
})
