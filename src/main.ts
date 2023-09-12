import { createApp } from 'vue'
import 'virtual:uno.css'
import App from './App.vue'
import { pinia } from '~/states'
import '~/elements'

createApp(App)
    . use(pinia)
    . mount('#app')
