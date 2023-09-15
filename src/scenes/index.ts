import { defineAsyncComponent } from 'vue'

export default {
    Start: defineAsyncComponent(() => import('./Start.vue')),
    Login: defineAsyncComponent(() => import('./Login.vue'))
} as Record<string, any>
