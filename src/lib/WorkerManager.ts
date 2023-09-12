// import Worker from "~/lib/Worker.js?worker"
import { Runner } from "pixi.js"


export class WorkerManager {
    private static instance: WorkerManager

    worker: Worker

    runner: Runner

  
    constructor() {
        this.runner = new Runner("receive")
        this.worker =  new Worker("./worker.js")
        this.worker.onmessage = (e) => this.onmessage(e)
    }

    destroy() {
        this.runner.removeAll()
        this.runner.destroy()
        this.worker.terminate()
    }

    register(item: unknown) {
        this.runner.add(item)
    }

    remove(item: unknown) {
        this.runner.remove(item)
    }

    post(data: unknown) {
        this.worker.postMessage(data)
    }

    onmessage(e: unknown) {
        this.runner.emit(e)
    }
    
    public static getInstance() {
        if (!WorkerManager.instance) {
            WorkerManager.instance = new WorkerManager()
        }
    
        return WorkerManager.instance
    }
}