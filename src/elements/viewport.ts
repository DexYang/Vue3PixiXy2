import type { IViewportOptions } from 'pixi-viewport'
import { Viewport } from 'pixi-viewport'

import { renderer } from 'vue3-pixi'

renderer.use({
    name: 'Viewport',
    createElement: (props: IViewportOptions) => new Viewport(props)
})
