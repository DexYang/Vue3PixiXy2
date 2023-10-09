import type { Character } from './character'
import { getCharacter } from './character'

export interface IPlayer {
    id: string

    char_id: number

    name: string

    race: string

    gender: 0 | 1

    level: number

    map: string

    x: number

    y: number

    watchMapChange: () => void
}

export class Player {
    data: IPlayer

    character: Character

    constructor(data: IPlayer) {
        this.data = data
    }

    async setup(data: IPlayer) {
        this.character = await getCharacter(this.data.char_id)
        this.character.position.set(this.data.x, this.data.y)
        this.character.position.cb = function () {
            this._localID++
            data.x = this.position._x
            data.y = this.position._y
        }
    }
}

export async function getPlayer(data: any) {
    const player = new Player(data)
    await player.setup(data)
    return player
}
