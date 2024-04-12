import * as Comlink from "comlink"
import nodeEndpoint from "comlink/dist/esm/node-adapter.mjs"
import { GameSide, RpgCommonGame } from "./Game"
import { PROPERTIES } from "./PhysicCommon"

interface ObjectWorker {
    setPosition(params: { x: number, y: number }): Promise<void>
    setHitbox(params: { width: number, height: number }): Promise<void>
    getPosition(): { x: number, y: number }
}

export class PhysicScene {
    sharedBuffer: SharedArrayBuffer = new SharedArrayBuffer(1024)
    bodies = new Int32Array(this.sharedBuffer)
    i: number = 0
    worker: Worker
    side: GameSide
    private physicWorker
    
    constructor(private gameEngine: RpgCommonGame) {
        this.worker = gameEngine.worker
        this.side = gameEngine.side
    }

    async createWorker() {
        let pathWorker 
        if (this.side == GameSide.Client) {
            pathWorker = new URL("./PhysicWorker.js", import.meta.url).href
        }
        else {
            pathWorker = __dirname + "/PhysicWorker.js"
        }
        const worker = new this.worker(pathWorker, {
            type: "module"
        })
        const PhysicWorker = Comlink.wrap(this.side == GameSide.Client ? worker : nodeEndpoint(worker))
        this.physicWorker = await new PhysicWorker(this.sharedBuffer)
        return this.physicWorker
    }

    private assignSharedBufferIndex() {
        return this.i++
    }

    async addObject(instance, options) {
        const index = this.assignSharedBufferIndex()
        instance.sharedBufferIndex = index

        await this.physicWorker.addBody(index, options)
       
        return instance
    }

    getObject(instance): ObjectWorker {
        const index = instance.sharedBufferIndex
        const nbProperties = Object.keys(PROPERTIES).length
        const getValue = (propName) => this.bodies[index * nbProperties + PROPERTIES[propName]]
        return {
            setPosition: (params) => this.physicWorker.setPosition(index, params),
            setHitbox: (params) => this.physicWorker.setHitbox(index, params),
            getPosition: () => ({
                x: getValue("x"),
                y: getValue("y")
            }),
        }
    }
}