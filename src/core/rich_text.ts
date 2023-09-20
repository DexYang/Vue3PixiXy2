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
    '#b': ['mode', 'blink'],
    '#i': ['mode', 'italic'],
    '#u': ['mode', 'underline'],
    '#n': ['mode', 'reset'],
    '#r': ['mode', 'enter']
} as Record<string, Array<string>>

export function translate(text: string) {
    const regex = /#((\d{1,3})|(R|G|B|K|Y|W|pink|gold|grey|brown|purple|orange|c[0-9a-fA-F]{6})|(d|b|i|u|n|r))/g
    // 正则表达式，3段分组：第一组(match[2])不为undefined则匹配到表情，第二组(match[3])不为undefined则匹配到颜色，，第三组(match[4])不为undefined则匹配到格式
    const contents: Array<string | Array<string>> = []
    let match
    let last_index = 0
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(text)) !== null) {
        console.log(match)
        if (last_index !== match.index)
            contents.push(text.substring(last_index, match.index))
        last_index = match.index + match[0].length
        if (!Number.isNaN(Number(match[1])))
            contents.push(['EMOTE', match[1].padStart(2, '0')])
        else if (match[0] in dictionary)
            contents.push(dictionary[match[0]])
        else if (match[1].startsWith('c'))
            contents.push(['color', match[1].substring(1)])
    }
    if (last_index !== text.length)
        contents.push(text.substring(last_index))
    return contents
}

function getStyle(font: string) {
    return {
        fontFamily: font
    }
}

export function rebuild(contents: Array<string | Array<string>>, font: string) {
    let style = getStyle(font)
    console.log(contents, style)
    style = getStyle(font)
}

export function getRichText(text: string, font: string) {
    const contents = translate(text)
    return rebuild(contents, font)
}
