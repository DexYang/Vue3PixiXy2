import { defineStore } from 'pinia'
import { directoryOpen } from 'browser-fs-access'
import type { Ref } from 'vue'
import { ref } from 'vue'
import fontData from '~/data/font'

interface IResourceState {
    isResourceLoaded: boolean
    resources: Map<string, FileSystemFileHandle>
}

const saveFiles = ['save']

const exploreFiles = ['scene', 'newscene', 'font']

export const useResourceState = defineStore('resource', () => {
    const resourcesState: Ref<IResourceState> = ref({
        isResourceLoaded: false,
        resources: new Map<string, FileSystemFileHandle>()
    })

    const save = async (json: string) => {
        console.log(json, saveFiles)
    }

    const loadFont = async () => {
        for (const font_name in fontData) {
            const font_path = fontData[font_name]
            try {
                const handle = resourcesState.value.resources.get(font_path)
                if (handle) {
                    const file = await handle.getFile()
                    const font_buf: ArrayBuffer | null = await file.arrayBuffer()
                    const font_face = new FontFace(font_name, font_buf)
                    const loaded_font_face = await font_face.load()
                    document.fonts.add(loaded_font_face)
                    console.log(`字体加载成功 - ${font_name} - ${font_path}`)
                }
            }
            catch (error) {
                console.error(`字体加载失败 - ${font_name} - ${font_path}`)
            }
        }
    }

    const loadResource = async () => {
        const blobsInDirectory = await directoryOpen({
            recursive: true,
            skipDirectory: (entry) => {
                return (!exploreFiles.includes(entry.name))
            }
        })
        blobsInDirectory.forEach((item) => {
            if (item instanceof File && item.directoryHandle && item.handle) {
                if (exploreFiles.includes(item.directoryHandle.name))
                    resourcesState.value.resources.set(`${item.directoryHandle.name}/${item.handle.name}`, item.handle)
                else
                    resourcesState.value.resources.set(`${item.handle.name}`, item.handle)
            }
        })
        resourcesState.value.isResourceLoaded = true
        loadFont()
    }

    return {
        resourcesState,
        loadResource,
        save
    }
})
