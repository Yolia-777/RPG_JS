import { Behavior, ClientMode, MoveClientMode, Position } from "@rpgjs/types";
import { Subject } from "rxjs";
import SAT from "sat";
import { GameSide, RpgCommonGame } from "./Game";
import { RpgCommonMap, TileInfo } from "./Map";
import { RpgShape } from "./Shape";
import { Vector2d } from "./Vector2d";

const ACTIONS = { IDLE: 0, RUN: 1, ACTION: 2 };

type CollisionOptions = {
  collision?: (event: AbstractObject) => void;
  near?: (event: AbstractObject) => void;
  allSearch?: boolean;
};

export class AbstractObject {
  map: string = "";
  height: number = 0;
  width: number = 0;
  speed: number;
  direction: number = 3;
  moving: boolean = false;

  /*
        Properties for move mode
    */
  checkCollision: boolean = true;
  clientModeMove: ClientMode = MoveClientMode.ByDirection;
  behavior: Behavior = Behavior.Direction;

  hitbox: SAT.Box;

  inShapes: {
    [shapeId: string]: RpgShape;
  } = {};

  disableVirtualGrid: boolean = false;

  private shapes: RpgShape[] = [];
  private _position: Vector2d;
  private _hitboxPos: SAT.Vector;
  private collisionWith: AbstractObject[] = [];
  private _collisionWithTiles: TileInfo[] = [];
  private _collisionWithShapes: RpgShape[] = [];

  private destroyMove$: Subject<boolean> = new Subject<boolean>();
  // notifier for destroy
  _destroy$: Subject<void> = new Subject();

  private hitbox: { width: number; height: number };

  static get ACTIONS() {
    return ACTIONS;
  }

  constructor(
    public gameEngine: RpgCommonGame,
    public playerId: string,
    private sharedBufferIndex
  ) {}

  get id() {
    return this.playerId;
  }

  set id(str: string) {
    this.playerId = str;
  }

  /**
   * Get/Set position x, y and z of player
   *
   * z is the depth layer. By default, its value is 0. Collisions and overlays will be performed with other objects on the same z-position.
   *
   * @title Get/Set position
   * @prop { { x: number, y: number, z: number } } position
   * @memberof Player
   */
  /* set position(val: Position | Vector2d) {
        if (this.isDestroyed) return
        const { x, y, z } = val
        if (!isInstanceOf(val, Vector2d)) {
            val = new Vector2d(x, y, z)
        }
        this._hitboxPos.x = x
        this._hitboxPos.y = y
        this._hitboxPos.z = z
        this.updateInVirtualGrid()
        this._position = new Proxy<Vector2d>(val as Vector2d, {
            get: (target, prop: string) => target[prop],
            set: (target, prop, value) => {
                this._hitboxPos[prop] = value
                target[prop] = value
                this.updateInVirtualGrid()
                return true
            }
        })
    }

   
    */

  get position(): Vector2d {
    const { physicScene } = this.mapInstance;
    const { x, y } = physicScene.getObject(this).getPosition();
    return new Vector2d(x, y);
  }

  /** @internal */
  get mapInstance(): RpgCommonMap {
    if (this.gameEngine.side == GameSide.Client) {
      return RpgCommonMap.bufferClient.get(this.map);
    }
    return RpgCommonMap.buffer.get(this.map);
  }

  /**
   * Define the hitbox of the player.
   *
   * ```ts
   * player.setHitbox(20, 20)
   * ```
   *
   * @title Set Hitbox
   * @method player.setHitbox(width,height)
   * @param {number} width
   * @param {number} height
   * @returns {void}
   * @memberof Player
   */
  setHitbox(width: number, height: number): Promise<void> {
    if (!this.mapInstance) {
      this.hitbox = { width, height };
      return Promise.resolve();
    }
    const { physicScene } = this.mapInstance;
    return physicScene.getObject(this).setHitbox({ width, height });
  }

  setPosition({ x, y, tileX, tileY }): Promise<void> {
    const { tileWidth, tileHeight, physicScene } = this.mapInstance;
    const position = {} as Position;
    if (x !== undefined) position.x = x;
    if (y !== undefined) position.y = y;
    if (tileX !== undefined) position.x = tileX * tileWidth;
    if (tileY !== undefined) position.y = tileY * tileHeight;
    return physicScene.getObject(this).setPosition(position);
  }

  /** @internal */
  async execMethod(methodName: string, methodData?, instance?) {}
}

export interface AbstractObject {
  readonly type: string;
  through: boolean;
  throughOtherPlayer: boolean;
  autoChangeMap?(nextPosition: Position): Promise<boolean>;
  execMethod(methodName: string, methodData?, instance?);
  changeMap(mapName: string);
  syncChanges();
}
