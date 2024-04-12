import * as Comlink from "comlink";
import nodeEndpoint from "comlink/dist/esm/node-adapter.mjs";
import type { Body as MatterBody, Engine as MatterEngine, World } from "matter-js";
import pkg from "matter-js";
import { parentPort } from "worker_threads";
import { PROPERTIES } from "./PhysicCommon.js";
import { Scheduler } from "./Scheduler.js";

const { Bodies, Engine, Composite, Events, Body, World } = pkg;

interface BodyOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class PhysicWorker {
  engine: MatterEngine;
  bodies: Int32Array;
  world: World;
  scheduler: Scheduler;
  relations: Map<number, Body> = new Map();

  constructor(sharedBuffer) {
    this.bodies = new Int32Array(sharedBuffer);
    this.engine = Engine.create({
      gravity: {
        x: 0,
        y: 0,
      },
    });

    // Events.on(this.engine, "collisionStart", ({ pairs }) => {
    //   console.log('in', pairs[0]);
    // });

    // Events.on(this.engine, "collisionEnd", ({ pairs }) => {
    //     console.log('out', pairs[0]);
    //   });

    this.world = this.engine.world;
    this.scheduler = new Scheduler();
    this.run();
  }

  run() {
    this.scheduler.start();
    this.scheduler.tick.subscribe(({ deltaTime }) => {
      Engine.update(this.engine, deltaTime);
    });
  }

  update(sharedArrayBuffer: SharedArrayBuffer) {
    const positions = new Float32Array(sharedArrayBuffer);
  }

  addBody(index: number, options: BodyOptions) {
    const body = Bodies.rectangle(
      options.x,
      options.y,
      options.width,
      options.height
    );

    let prevValue = {
      x: 0,
      y: 0,
    };

    const nbProperties = Object.keys(prevValue).length;

    const createPropertiesProxy = (position) => {
      const handler = {
        set: (target, property, value) => {
          value = Math.round(value * 100) / 100;
          if (prevValue[property] !== value) {
            Atomics.add(
              this.bodies,
              index * nbProperties + PROPERTIES[property],
              value
            );
          }
          prevValue[property] = value;
          target[property] = value;
          return true;
        },
      };

      return new Proxy(position, handler);
    };

    body.position = createPropertiesProxy(body.position);

    Composite.add(this.world, body);

    this.relations.set(index, body);
  }

  setPosition(index: number, position) {
    const { x, y } = position;
    const body = this.relations.get(index);
    Body.setPosition(body, { x, y });
  }

  setHitbox(index: number, hitbox) {
    const { width, height } = hitbox;
    const body = this.relations.get(index) as MatterBody;
    Body.scale(body, width / body.bounds.max.x, height / body.bounds.max.y);
  }
}

Comlink.expose(PhysicWorker, parentPort ? nodeEndpoint(parentPort) : undefined);
