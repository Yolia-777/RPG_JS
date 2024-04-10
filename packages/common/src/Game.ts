import { TiledObjectClass } from '@rpgjs/tiled'
import { Control, Controls, Direction, constructor } from '@rpgjs/types'
import * as Comlink from "comlink"
import nodeEndpoint from "comlink/dist/esm/node-adapter.mjs"
import { EventEmitter } from './EventEmitter'
import { HitObject } from './Hit'
import { RpgCommonPlayer } from './Player'
import { RpgPlugin } from './Plugin'
import { RpgShape } from './Shape'
import { generateUID, isClass } from './Utils'

export enum GameSide {
    Server = 'server',
    Client = 'client',
    Worker = 'worker'
}

export class RpgCommonGame extends EventEmitter {
    events: any
    world: any
    side: GameSide
    physicWorker: any
    worker: Worker
    sharedBuffer: SharedArrayBuffer = new SharedArrayBuffer(1024)
    bodies = new Int32Array(this.sharedBuffer)

    async initialize(side: GameSide, worker: Worker) {
        this.side = side
        this.worker = worker
        this.events = {} // events for all player in map
        let pathWorker
        this.physicWorker = await this.createWorker()
        await this.physicWorker.addBody({
            x: 555,
            y: 0,
            width:100,
            height:100
        })
        console.log(this.bodies[0])
    }

    get isWorker() {
        return this.side == 'worker'
    }

    start(world) {
        this.world = world
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
        return await new PhysicWorker(this.sharedBuffer)
    }

    addObject(_class, playerId?: string) {
        let event
        if (!playerId) playerId = generateUID()
        if (isClass(_class)) {
            if (this.side == GameSide.Client) {
                event = new _class(this, playerId)
            }
            else {
                event = new _class(playerId)
            }
        }
        else {
            event = _class
        }
       
        return event
    }

    addPlayer(playerClass, playerId?: string) {
        const player = this.addObject(playerClass, playerId)
        return player
    }

    addEvent<T>(eventClass: constructor<T>, eventId?: string): T {
        const event = this.addObject(eventClass, eventId)
        return event
    }

    addShape(obj: HitObject): RpgShape {
        const id = obj.name = (obj.name || generateUID()) as string
        const shape = new RpgShape(obj as TiledObjectClass)
        shape.name = id
        return shape
    }

    async processInput<RpgPlayer extends RpgCommonPlayer>(playerId: string, controls?: Controls): Promise<{
        player: RpgPlayer,
        inputs: string[]
    }> {
        const player: RpgPlayer = this.world.getObject(playerId)
        const inputs: string[] = []

        if (!player) return {
            player,
            inputs
        }

        const routesMove: any = []

        while (player.pendingMove.length > 0) {
            const inputData = player.pendingMove.shift()
            
            let { input, deltaTimeInt } = inputData as any
            let moving = false

            if (controls && controls[input]) {
                const control = controls[input]
                const now = Date.now()
                const inputTime = player.inputsTimestamp[input] || 0

                if (inputTime >= now) {
                    continue
                }

                if (control.delay) {
                    let duration: number
                    let otherControls: (string | Control)[] = []

                    if (typeof control.delay == 'number') {
                        duration = control.delay
                    }
                    else {
                        duration  = control.delay.duration
                        if (control.delay.otherControls) {
                            otherControls = control.delay.otherControls
                        }
                    }

                    player.inputsTimestamp[input] = now + duration

                    for (let control of otherControls) {
                        player.inputsTimestamp[control] = now + duration
                    }
                }                
            }
            
            if (input == Control.Action) {
                await player.triggerCollisionWith(RpgCommonPlayer.ACTIONS.ACTION)
            }
            else if (
                input == Direction.Left ||
                input == Direction.Right ||
                input == Direction.Up ||
                input == Direction.Down
            ) {
                player.moving = true
                moving = true
                const isMove = await player.moveByDirection(+input, deltaTimeInt || 1)
                if (isMove) {
                    routesMove.push(inputData)
                }
            }
            // TODO, is Worker
            // verify if is server because, rpg mode causes a bug (see #184)
            if (this.side == GameSide.Server) {
                await RpgPlugin.emit('Server.onInput', [player, {
                    ...inputData,
                    moving
                }], true)
            }

            inputs.push(input)
        }


        return {
            player,
            inputs
        }
    }
}
