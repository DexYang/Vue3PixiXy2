import { defineAsyncComponent } from 'vue'

export default {
    Loading: defineAsyncComponent(() => import('./Loading.vue'))
}
