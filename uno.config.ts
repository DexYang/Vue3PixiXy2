import {
    defineConfig,
    presetAttributify,
    presetIcons,
    presetUno,
    presetWebFonts
} from 'unocss'

export default defineConfig({
    shortcuts: [],
    rules: [
        ['win98-box-shadow', { 'box-shadow': 'inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px grey, inset 2px 2px #fff' }]
    ],
    presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
            scale: 1.2,
            warn: true
        }),
        presetWebFonts({
            fonts: {
                sans: 'DM Sans',
                serif: 'DM Serif Display',
                mono: 'DM Mono'
            }
        })
    ]
})
