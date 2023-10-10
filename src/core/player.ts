import { storeToRefs } from 'pinia'
import { Character } from './character'
import { usePlayerState } from '~/states/modules/players_state'

export interface IPlayer {
    key?: string

    id: string

    char_id: number

    name: string

    race: string

    gender: 0 | 1

    level: number

    map: string

    x: number

    y: number

    watchMapChange?: () => void
}

export class Player extends Character<IPlayer> {
    constructor(data: IPlayer) {
        super(data.char_id)
        this.data = data
        this.position.set(this.data.x, this.data.y)
        this.position.cb = function () {
            this._localID++
            data.x = this.position._x
            data.y = this.position._y
        }
        this.on('click', () => {
            const usePlayerStateSetup = usePlayerState()
            const { primary } = storeToRefs(usePlayerStateSetup)
            primary.value = this.data.key!
        })
    }
}

export async function getPlayer(data: any) {
    const player = new Player(data)
    await player.setup()
    return player
}
