const modes: Record<string, Array<string>> = {
    default: ['gires.wdf', 'cursor/a.tca'],
    pointer: ['gires.wdf', 'cursor/c.tca'],
    input: ['gires.wdf', 'cursor/b.tca'],
    chat: ['gires.wdf', 'cursor/chat.tcp'],
    disabled: ['gires.wdf', 'cursor/d.tca'],
    give: ['gires.wdf', 'cursor/m.tca'],
    trade: ['gires.wdf', 'cursor/i.tca'],
    friend: ['gires.wdf', 'cursor/g.tca'],
    magic: ['gires.wdf', 'cursor/k.tca'],
    fight: ['gires.wdf', 'cursor/o.tca'],
    protect: ['gires.wdf', 'cursor/q.tca'],
    capture: ['gires.wdf', 'cursor/s.tca']
}

export default modes
