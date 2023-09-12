import { defineStore } from 'pinia'
import { directoryOpen } from 'browser-fs-access'
import type { Ref } from 'vue'
import { ref } from 'vue'

interface IResourceState {
    isResourceLoaded: boolean
    resources: Map<string, FileSystemFileHandle>
}

const saveFiles = ['save']

const exploreFiles = ['scene', 'newscene', 'font']

export const useResourceState = defineStore('scenes', () => {
    const resourcesState: Ref<IResourceState> = ref({
        isResourceLoaded: false,
        resources: new Map<string, FileSystemFileHandle>()
    })

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
    }

    const save = async (json: string) => {
        console.log(json, saveFiles)
    }

    return {
        resourcesState,
        loadResource,
        save
    }
})
