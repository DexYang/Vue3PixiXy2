import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'

interface ITip {
    id: string
    index: number
    text: string
    x: number
    y: number
}

export const useTipState = defineStore('tips', () => {
    const tipsState: Ref<Array<ITip>> = ref([])

    const remove = (index: number, id: string) => {
        if (tipsState.value[index].id === id) {
            console.log('index', tipsState.value)
            tipsState.value = tipsState.value.splice(index, 1)
        }
        else {
            for (let i = 0; i < tipsState.value.length; i++) {
                if (tipsState.value[i].id === id) {
                    console.log('id', tipsState.value)
                    tipsState.value = tipsState.value.splice(i, 1)
                    return
                }
            }
        }
    }

    const notify = async (text: string) => {
        const size = tipsState.value.length
        const tip: ITip = {
            id: Math.random().toString().substring(2),
            index: size,
            text,
            x: size * 10 % 60,
            y: size * 10 % 60
        }
        const { start } = useTimeoutFn(() => remove(size, tip.id), 5000)
        start()
        tipsState.value.push(tip)
    }

    return {
        tipsState,
        notify,
        remove
    }
})
