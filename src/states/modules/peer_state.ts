import { defineStore, storeToRefs } from 'pinia'
import type { DataConnection } from 'peerjs'
import { Peer } from 'peerjs'
import { useTimeoutFn, watchDebounced, watchThrottled } from '@vueuse/core'
import { computed, ref, shallowRef, watch } from 'vue'
import { useAccountState } from './account_state'
import type { IPlayer, Player } from '~/core/player'
import { useAccountStorage } from '~/storage/account'

export const usePeerState = defineStore('peer', () => {
    const peer = new Peer()

    const connectPool = ref<Record<string, DataConnection>>({})

    const id = ref<string>()

    const remoteData = ref<Record<string, Record<string, IPlayer>>>({})

    const useAccountStateSetup = useAccountState()
    const { accountState } = storeToRefs(useAccountStateSetup)

    const storage = computed(() => useAccountStorage(accountState.value.account).value)

    peer.on('open', (_id) => {
        console.log(`My peer ID is: ${_id}`)
        id.value = _id
    })

    // receive
    const receive = (conn: DataConnection) => {
        return (data: any) => {
            if (data.type && data.type === 'players') {
                if (!(conn.peer in remoteData.value))
                    remoteData.value[conn.peer] = {}
                remoteData.value[conn.peer] = data.players
            }
            console.log(remoteData.value)
        }
    }

    const broadcast = (data: any) => {
        Object.values(connectPool.value).forEach((item) => {
            item.send(data)
        })
    }

    const send = (peerId: string, data: any) => {
        if (peerId in connectPool.value)
            connectPool.value[peerId].send(data)
    }

    const onOpen = (conn: DataConnection) => {
        return () => {
            console.log('连接成功:', conn.peer)
        }
    }

    // 被连接
    peer.on('connection', (conn) => {
        connectPool.value[conn.peer] = conn
        conn.on('data', receive(conn))
        conn.on('open', onOpen(conn))
    })

    // 主动连接
    const connect = (peerId: string) => {
        const conn = peer.connect(peerId)
        connectPool.value[peerId] = conn
        conn.on('data', receive(conn))
        conn.on('open', onOpen(conn))
    }

    const { start } = useTimeoutFn(() => {
        const data = {
            type: 'players',
            players: storage.value.players
        }
        broadcast(data)
        start()
    }, 1000)

    return {
        id,
        peer,
        connect,
        receive,
        broadcast,
        send,
        remoteData
    }
})
