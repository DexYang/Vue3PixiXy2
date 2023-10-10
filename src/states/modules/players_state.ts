import { defineStore } from 'pinia'
import { computed, ref, shallowRef, watch } from 'vue'
import type { Player } from '~/core/player'
import { getPlayer } from '~/core/player'
import { type IAccount, useAccountStorage } from '~/storage/account'

interface IAccountState {
    account: string
    players: Set<string>
    primary: string
}

interface IPlayerState {
    MapIndex: Record<string, Set<string>>
    logId: number
}

export const usePlayerState = defineStore('player', () => {
    const playersPool = shallowRef<Record<string, Player>>({})

    const accountState = ref<IAccountState>({
        account: '',
        players: new Set(),
        primary: ''
    })

    // 按地图索引players
    const playerState = ref<IPlayerState>({
        MapIndex: {},
        logId: 0
    })

    const login = async (account: string) => {
        const storage = useAccountStorage(account)
        accountState.value.account = account

        let id: keyof IAccount['players']
        for (id in storage.value.players) {
            const data = storage.value.players[id]
            const key = `${account}/${id}`
            data.key = key

            if (accountState.value.primary === '')
                accountState.value.primary = key

            playersPool.value[key] = await getPlayer(data)
            accountState.value.players.add(key)

            data.watchMapChange = watch(() => data.map, () => {
                playerState.value.MapIndex = {}

                Object.keys(storage.value!.players).forEach(async (id) => {
                    const data = storage.value!.players[id]
                    const map = data.map
                    const key = `${account}/${id}`
                    if (!(map in playerState.value.MapIndex))
                        playerState.value.MapIndex[map] = new Set<string>()
                    playerState.value.MapIndex[map].add(key)
                })
            }, { immediate: true })
        }
    }

    const primary = computed({
        set: (primary: string) => accountState.value!.primary = primary,
        get: () => accountState.value!.primary
    })

    const getPrimary = computed(() => playersPool.value[primary.value])

    const getPlayers = computed(() => {
        const res: Array<Player> = []
        const map = getPrimary.value.data.map
        const mapPlayerSet = playerState.value.MapIndex[map]
        if (!mapPlayerSet)
            return []
        mapPlayerSet.forEach((key) => {
            res.push(playersPool.value[key])
        })
        return res
    })

    return {
        accountState,
        primary,
        getPrimary,
        login,
        playerState,
        getPlayers
    }
})
