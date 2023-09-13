import { defineAsyncComponent } from 'vue'

export default {
    Start: defineAsyncComponent(() => import('./Start.vue'))
}
