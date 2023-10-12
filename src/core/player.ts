import { storeToRefs } from 'pinia'
import { Character } from './character'
import { usePlayerState } from '~/states/modules/players_state'

export interface IPlayer {
    parent?: Player

    key: string

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
    constructor(data: IPlayer, local: boolean) {
        super(data.char_id)
        this.data = data
        this.name = data.key
        // data.parent = this
        Object.defineProperty(this.data, 'parent', {
            value: this,
            writable: true,
            enumerable: false,
            configurable: true
        })
        this.position.set(this.data.x, this.data.y)
        if (local) {
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
        // this.on('rightclick', (event) => {
        //     this.dispatchEvent(event)
        // })
    }
}

// export class Player {
//     data: IPlayer

//     character: Character<any>

//     constructor(data: IPlayer) {
//         this.data = data
//     }

//     async setup(data: IPlayer) {
//         this.character = await getCharacter(this.data.char_id)
//         this.character.position.set(this.data.x, this.data.y)
//         this.character.position.cb = function () {
//             this._localID++
//             data.x = this.position._x
//             data.y = this.position._y
//         }
//     }
// }

export async function getPlayer(data: any, local = true) {
    const player = new Player(data, local)
    await player.setup()
    return player
}
