import { AnimatedSprite, Text, TextStyle } from 'pixi.js'
import type { WAS } from '~/lib/WAS'
import { emotePath, emoteWdf } from '~/data/emote'
import { useWDFManager } from '~/lib/WDFManager'
import { settings } from '~/settings'

const dictionary = {
    '#R': ['color', 'red'],
    '#G': ['color', 'green'],
    '#B': ['color', 'cyan'],
    '#K': ['color', 'black'],
    '#Y': ['color', 'yellow'],
    '#W': ['color', 'white'],

    '#pink': ['color', 'pink'],
    '#gold': ['color', 'gold'],
    '#grey': ['color', 'grey'],
    '#brown': ['color', 'brown'],
    '#purple': ['color', 'purple'],
    '#orange': ['color', 'orange'],

    '#d': ['mode', 'bold'],
    '#i': ['mode', 'italic'],
    '#n': ['mode', 'reset'],
    '#r': ['mode', 'enter']
} as Record<string, Array<string>>

export function translate(text: string) {
    const regex = /#(\d{1,3}|R|G|B|K|Y|W|pink|gold|grey|brown|purple|orange|c[0-9a-fA-F]{6}|d|i|n|r)/g
    // 正则表达式，3段分组：第一组(match[2])不为undefined则匹配到表情，第二组(match[3])不为undefined则匹配到颜色，，第三组(match[4])不为undefined则匹配到格式
    const contents: Array<string | Array<string>> = []
    let match
    let last_index = 0
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(text)) !== null) {
        if (last_index !== match.index)
            contents.push(text.substring(last_index, match.index))
        last_index = match.index + match[0].length
        if (!Number.isNaN(Number(match[1])))
            contents.push(['EMOTE', match[1].padStart(2, '0')])
        else if (match[0] in dictionary)
            contents.push(dictionary[match[0]])
        else if (match[1].startsWith('c'))
            contents.push(['color', `#${match[1].substring(1)}`])
    }
    if (last_index !== text.length)
        contents.push(text.substring(last_index))
    return contents
}

function getStyle(fontFamily: string, fontSize: number) {
    return new TextStyle({
        fontFamily,
        fontSize,
        fill: '#FFFFFF',
        dropShadow: false,
        dropShadowDistance: 0.5,
        fontStyle: 'normal',
        fontWeight: 'normal'
    })
}

interface Line {
    no: number
    width: number
    height: number
    y: number
    items: Array<any>
}

export async function rebuild(
    contents: Array<string | Array<string>>,
    width: number,
    fontFamily: string,
    fontSize = 14,
    lineHeight = 5
) {
    let style = getStyle(fontFamily, fontSize)

    const lines: Array<Line> = []
    let line: Line = {
        no: 0,
        width: 0,
        height: fontSize,
        y: 0,
        items: []
    }
    let text = ''
    for (let i = 0; i < contents.length; i++) {
        const item: string | Array<string> = contents[i]
        if (typeof item === 'string') { // 如果是string
            for (let j = 0; j < item.length; j++) {
                const s = item[j]
                text += s
                line.width += getStrWidth(s) * fontSize // 当前行，增加宽度
                if (line.width > width - 5) {
                    line.items.push(new Text(text, style))
                    text = ''
                    lines.push(line)
                    line = getNewLine(line, fontSize, lineHeight)
                }
            }
            if (text !== '') {
                line.items.push(new Text(text, style))
                text = ''
            }
        }
        else if (Array.isArray(item)) {
            if (item[0] === 'EMOTE') {
                const wdfManager = useWDFManager()
                const was: WAS = await wdfManager.get(emoteWdf, emotePath(item[1])) as WAS
                const frames = was.readFrames(settings.action_duration)
                const ani = new AnimatedSprite(frames[0], true)
                ani.updateAnchor = true
                ani.visible = false
                ani.eventMode = 'none'
                ani.play()
                ani.visible = true
                line.items.push(ani)
                line.width += ani.width
                line.height = Math.max(line.height, ani.height)
                if (line.width > width - 5) {
                    lines.push(line)
                    line = getNewLine(line, fontSize, lineHeight)
                }
            }
            else {
                if (item[0] === 'color') {
                    style.fill = item[1]
                }
                else if (item[1] === 'bold') {
                    style.fontWeight = 'bold'
                }
                else if (item[1] === 'italic') {
                    style.fontStyle = 'italic'
                }
                else if (item[1] === 'reset') {
                    style = getStyle(fontFamily, fontSize)
                }
                else if (item[1] === 'enter') {
                    lines.push(line)
                    line = getNewLine(line, fontSize, lineHeight)
                }
            }
        }
    }
    if (line.items.length > 0)
        lines.push(line)

    const res = []
    for (let i = 0; i < lines.length; i++) {
        const _line = lines[i]
        let x = 0
        const y = _line.y
        for (let j = 0; j < _line.items.length; j++) {
            const item = _line.items[j]
            item.position = [x, y + _line.height - item.height + 2]
            item.x = x
            item.y = y + _line.height - item.height + 2
            x += item.width + 2
            res.push(item)
        }
    }

    return res
}

function getNewLine(line: Line, fontSize: number, lineHeight: number) {
    return {
        no: line.no + 1,
        width: 0,
        height: fontSize,
        y: line.height + lineHeight + line.y,
        items: []
    }
}

function getStrWidth(s: string) {
    if (s.match(/[\u4E00-\u9FA5]/g) || s.match(/[\uFF00-\uFFFF]/g))
        return 1
    return 0.5
}

export async function getRichText(
    text: string,
    width = 100,
    fontFamily = 'Arial, Helvetica, sans-serif',
    fontSize = 16,
    lineHeight = 5
) {
    const contents = translate(text)
    return await rebuild(contents, width, fontFamily, fontSize, lineHeight)
}
