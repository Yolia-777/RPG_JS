import * as Comlink from 'comlink';
import nodeEndpoint from 'comlink/dist/esm/node-adapter.mjs';
import pkg from 'matter-js';
import { parentPort } from "worker_threads";

const { Bodies, Engine, World } = pkg;

export class PhysicWorker {
    engine: Engine;
    bodies: any = []

    constructor(sharedBuffer) {
        this.bodies = new Int32Array(sharedBuffer);
        this.engine = Engine.create({
            gravity: {
                x: 0,
                y: 0
            }
        });
    }

    update(sharedArrayBuffer: SharedArrayBuffer) {
        const positions = new Float32Array(sharedArrayBuffer);
    }

    addBody(options) {
        const body = Bodies.rectangle(options.x, options.y, options.width, options.height, options);
        console.log('hello world')
        Atomics.add(this.bodies, 0, options.x);
    }
    
}

Comlink.expose(PhysicWorker, parentPort ? nodeEndpoint(parentPort) : undefined);