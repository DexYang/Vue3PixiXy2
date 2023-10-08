import { useStorage } from '@vueuse/core'
import type { IPlayer } from '~/core/player'

export interface IAccount {
    account: string
    players: Record<string, IPlayer>
}

const theDefault = {
    account: 'default',
    players: {
        1: {
            id: '1',
            char_id: 1,
            name: '名字',
            race: '人',
            gender: 1,
            level: 102,
            map: '新长安',
            x: 500,
            y: 500
        }
    }
}

export function useAccountStorage(key: string) {
    return useStorage(`__ACCOUNT__${key}`, theDefault as IAccount)
}
