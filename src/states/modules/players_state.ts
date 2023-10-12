import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useAccountState } from './account_state'
import { usePeerState } from './peer_state'
import type { Player } from '~/core/player'
import { getPlayer } from '~/core/player'

interface IPlayerState {
    MapIndex: Record<string, Set<string>>
    logId: number
}

export const usePlayerState = defineStore('player', () => {
    // 缓存player数据
    const playersPool = ref<Record<string, Player>>({})

    // 分地图索引players
    const playerState = ref<IPlayerState>({
        MapIndex: {},
        logId: 0
    })

    const { remoteData } = storeToRefs(usePeerState())

    const { accountState, primary } = storeToRefs(useAccountState())

    const rebuildMapIndex = (key: string) => {
        return (newVal: any, oldVal: any) => {
            if (oldVal)
                playerState.value.MapIndex[oldVal].delete(key)
            if (!playerState.value.MapIndex[newVal])
                playerState.value.MapIndex[newVal] = new Set<string>()
            playerState.value.MapIndex[newVal].add(key)
        }
    }

    // 本地player watch
    watch(() => Object.keys(accountState.value.players).length, async () => {
        // console.log('LOCAL LOAD', accountState.value.players, playersPool)
        for (const id in accountState.value.players) {
            const data = accountState.value.players[id]
            const key = data.key

            playersPool.value[key] = await getPlayer(data)

            data.watchMapChange = watch(() => data.map, rebuildMapIndex(key), { immediate: true })
        }
    }, { immediate: true })

    // Remote player watch
    watch(() => Object.keys(remoteData.value).length, async () => {
        console.log('REMOTE LOAD', remoteData.value)
        for (const peerId in remoteData.value) {
            const players = remoteData.value[peerId]
            for (const id in players) {
                const data = players[id]
                const key = `${peerId}/${id}`
                data.key = key

                playersPool.value[key] = await getPlayer(data)

                data.watchMapChange = watch(() => data.map, rebuildMapIndex(key), { immediate: true })
            }
        }
    }, { immediate: true })

    const getPrimary = computed(() => playersPool.value[primary.value])

    // console.log(playersPool, primary.value, getPrimary)

    const getPlayers = computed(() => {
        const res: Array<Player> = []
        if (getPrimary.value) {
            const map = getPrimary.value.data.map
            const mapPlayerSet = playerState.value.MapIndex[map]
            if (!mapPlayerSet)
                return []
            mapPlayerSet.forEach((key) => {
                res.push(playersPool.value[key])
            })
        }
        return res
    })

    return {
        accountState,
        primary,
        getPrimary,
        playerState,
        getPlayers
    }
})
