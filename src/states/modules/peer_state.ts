import { defineStore, storeToRefs } from 'pinia'
import type { DataConnection } from 'peerjs'
import { Peer } from 'peerjs'
import { useTimeoutFn, watchDebounced, watchThrottled } from '@vueuse/core'
import { computed, reactive, ref, toRefs } from 'vue'
import { Point } from 'pixi.js'
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
                for (const id in data.players) { // 遍历传来的各player
                    delete data.players[id]['key']
                    if (id in remoteData.value[conn.peer]) { // 如果已存在
                        for (const [k, v] of Object.entries(data.players[id])) {
                            // @ts-expect-error any
                            remoteData.value[conn.peer][id][k] = v
                        }
                    }
                    else {
                        remoteData.value[conn.peer][id] = ref(data.players[id])
                    }
                }
            }
            else if (data.type && data.type === 'path') {
                const id = data.id
                const path = data.path.map((item: any) => new Point(item.x, item.y))
                remoteData.value[conn.peer][id].parent!.setNewTarget(path, data.running)
            }
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
