import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Player } from '~/core/player'
import { getPlayer } from '~/core/player'
import { type IAccount, useAccountStorage } from '~/storage/account'

interface IAccountState {
    account: string
    players: Set<string>
    primary: string
}

export const usePlayerState = defineStore('player', () => {
    const playersPool = ref<Record<string, Player>>({})

    const accountState = ref<IAccountState>({
        account: '',
        players: new Set(),
        primary: ''
    })

    const playerState = ref<Record<string, Set<string>>>({})

    const login = async (account: string) => {
        const storage = useAccountStorage(account)
        accountState.value.account = account

        let id: keyof IAccount['players']
        for (id in storage.value.players) {
            const data = storage.value.players[id]
            const key = `${account}/${id}`

            if (accountState.value.primary === '')
                accountState.value.primary = key

            playersPool.value[key] = await getPlayer(data)
            accountState.value.players.add(key)
        }

        // watch(storage.value.players, () => {
        //     playerState.value = {}
        //     Object.keys(storage.value!.players).forEach(async (id) => {
        //         const data = storage.value!.players[id]
        //         const map = data.map
        //         const key = `${account}/${id}`
        //         if (!(map in playerState.value))
        //             playerState.value[map] = new Set<string>()
        //         playerState.value[map].add(key)
        //     })
        //     console.log('>>>', playerState.value)
        // })
    }

    const primary = computed({
        set: (primary: string) => accountState.value!.primary = primary,
        get: () => accountState.value!.primary
    })

    const getPrimary = computed(() => playersPool.value[primary.value])

    // const getPlayers = computed(() => {
    //     const res: Array<Player> = []
    //     console.log('<<<<<<<<<<<')
    //     const map = getPrimary.value.data.map
    //     const mapPlayerSet = playerState.value[map]
    //     if (!mapPlayerSet)
    //         return []
    //     mapPlayerSet.forEach((key) => {
    //         res.push(playersPool.value[key])
    //     })
    //     return res
    // })

    return {
        accountState: computed(() => accountState),
        primary,
        getPrimary,
        login,
        playerState
        // getPlayers
    }
})
