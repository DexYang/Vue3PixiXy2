import path from 'node:path'
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { compilerOptions, isCustomElement, transformAssetUrls } from 'vue3-pixi'

export default defineConfig({
    resolve: {
        alias: { '~/': `${path.resolve(__dirname, 'src')}/` }
    },
    base: './',
    plugins: [
        Vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => {
                        return tag === 'yellow-text' || tag === 'Viewport' || isCustomElement(tag)
                    }
                },
                transformAssetUrls
            }
        }),
        // https://github.com/antfu/vite-plugin-components
        Components({
            // 指定组件位置，默认是src/components
            dirs: ['src/components'],
            // ui库解析器
            // resolvers: [ElementPlusResolver()],
            extensions: ['vue'],
            dts: true
        }),
        UnoCSS()
    ],
    server: {
        hmr: true
    }
})
