import { createApp } from 'vue'
import 'virtual:uno.css'
import { renderer } from 'vue3-pixi'
import UIRenderer from 'vue3-pixi-ui'
import App from './App.vue'
import { pinia } from '~/states'
import '~/elements'

renderer.use(UIRenderer)

document.oncontextmenu = document.body.oncontextmenu = function (event) {
    event.preventDefault()
}

createApp(App)
    . use(pinia)
    . mount('#app')
