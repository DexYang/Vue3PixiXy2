import type { IViewportOptions } from 'pixi-viewport'
import { Viewport } from 'pixi-viewport'

import { patchProp as defPathProp, renderer } from 'vue3-pixi'

renderer.use({
    name: 'Viewport',
    createElement: (props: IViewportOptions) => {
        console.log(props)
        return new Viewport(props)
    },
    querySelector: (props) => {
        console.log(props)
    }
    // patchProp(el, key, prevValue, nextValue) {
    //     // handle special prop here..
    //     console.log(el, key, prevValue, nextValue)
    //     // or fallback to default
    //     return defPathProp(el, key, prevValue, nextValue)
    // },
    // insert(el, parent) {
    //     console.log('######insert########', el, parent)
    //     // 添加到canvas容器内
    //     parent.addChild(el)
    // },
    // remove(el): void {
    //     console.log('insert', el)
    // },
    // parentNode(node) {
    //     console.log('createText', node)
    // }
})
