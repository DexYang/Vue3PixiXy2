import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

export const allowRouter = [
    {
        name: 'Loading',
        path: '/',
        component: () => import('~/scenes/Loading.vue')
    }
]

const router = createRouter({
    history: createWebHashHistory(), // createWebHistory
    routes: allowRouter as RouteRecordRaw[]
})

export default router
