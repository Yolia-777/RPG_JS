import { HookClient, InjectContext, RpgPlugin, Utils } from "@rpgjs/common";
import { log } from "@rpgjs/common/lib/Logger";
import { SocketEvents, constructor } from "@rpgjs/types";
import { World } from "simple-room-client";
import { GameEngineClient } from "./GameEngine";
import { RpgRenderer } from "./Renderer";
import { _initSpritesheet } from "./Resources";
import { Spritesheet } from "./decorators/Spritesheet";

type MatchMakerResponse = {
  url: string;
  port: string;
};

export class RpgClientEngine {
  /**
   * Get the rendering
   *
   * @prop {RpgRenderer} [renderer]
   * @readonly
   * @memberof RpgClientEngine
   * */
  private renderer: RpgRenderer;
  private _serverUrl: string = "";

  /**
   * Get the socket
   *
   * @prop {Socket} [socket]
   * @readonly
   * @memberof RpgClientEngine
   * */
  public socket: any;
  io: any;

  /**
   * retrieve the global configurations assigned at the entry point
   *
   * @prop {object} [globalConfig]
   * @readonly
   * @memberof RpgClientEngine
   * */
  public globalConfig: any = {};

  private gameEngine = this.context.inject(GameEngineClient);

  envs?: object = {};

  constructor(private context: InjectContext, private scenes, private options) {
    this.envs = options.envs || {};
  }

  private async _init() {
    this.renderer = this.context.inject(RpgRenderer, [
      {
        selector: "#rpg",
        selectorCanvas: "#canvas",
        selectorGui: "#gui",
        canvas: {},
        gui: [],
        spritesheets: [],
        sounds: [],
        ...this.options,
      },
    ]);
    this.io = this.options.io;

    const pluginLoadResource = async (hookName: string, type: string) => {
      const resource = this.options[type] || [];
      this.options[type] = [
        ...(Utils.arrayFlat(await RpgPlugin.emit(hookName, resource)) || []),
        ...resource,
      ];
    };

    await pluginLoadResource(HookClient.AddSpriteSheet, "spritesheets");

    this.addSpriteSheet(this.options.spritesheets);
  }

  /**
   * Starts the client side and connects to the server
   *
   * @title Start Client Engine
   * @method start()
   * @returns {Promise< RpgClientEngine >}
   * @memberof RpgClientEngine
   */
  async start(
    options: { renderLoop: boolean } = {
      renderLoop: true,
    }
  ): Promise<RpgClientEngine> {
    await this._init();
    await this.renderer.init(this.scenes);
    // @ts-ignore
    const envUrl = this.envs.VITE_SERVER_URL;
    let serverUri = {} as MatchMakerResponse;
    await this.connection(
      serverUri.url
        ? serverUri.url + ":" + serverUri.port
        : envUrl
        ? envUrl
        : undefined
    );
    return this;
  }

  getResourceUrl(source: string): string {
    // @ts-ignore
    if (window.urlCache && window.urlCache[source]) {
      // @ts-ignore
      return window.urlCache[source];
    }

    if (source.startsWith("data:")) {
      return source;
    }

    // @ts-ignore
    const staticDir = this.envs.VITE_BUILT;

    if (staticDir) {
      return this.assetsPath + "/" + Utils.basename(source);
    }

    return source;
  }

  /**
   * Adds Spritesheet classes
   *
   * @title Add Spritesheet
   * @method addSpriteSheet(spritesheetClass|spritesheetClass[])
   * @param { Class|Class[] } spritesheetClass
   * @method addSpriteSheet(url,id)
   * @param {string} url Define the url of the resource
   * @param {string} id Define a resource identifier
   * @returns {Class}
   * @since 3.0.0-beta.3
   * @memberof RpgClientEngine
   */
  addSpriteSheet(spritesheetClass: constructor<any>);
  addSpriteSheet(url: string, id: string);
  addSpriteSheet<T = any>(
    spritesheetClass: constructor<T> | string,
    id?: string
  ): constructor<T> {
    if (typeof spritesheetClass === "string") {
      if (!id) {
        throw log("Please, specify the resource ID (second parameter)");
      }
      @Spritesheet({
        id,
        image: this.getResourceUrl(spritesheetClass),
      })
      class AutoSpritesheet {}
      spritesheetClass = AutoSpritesheet as any;
    }
    this.addResource(spritesheetClass, _initSpritesheet);
    return spritesheetClass as any;
  }

  private addResource(resourceClass, cb) {
    let array = resourceClass;
    if (!Utils.isArray(resourceClass)) {
      array = [resourceClass];
    }
    cb(array, this);
  }

  async processInput() {
    
  }

  /**
   *Connect to the server
   *
   * @title Connect to server
   * @method connection()
   * @returns {void}
   * @memberof RpgClientEngine
   */
  async connection(uri?: string) {
    const { globalConfig } = this;
    this.socket = this.io(uri, {
      auth: {
        token: this.gameEngine.session(),
      },
      ...(globalConfig.socketIoClient || {}),
    });

    this.socket.on(SocketEvents.LoadScene, ({ name, data }) => {
      this.renderer.loadScene(name, data);
    });

    this.socket.on("playerJoined", (playerEvent) => {
      this.gameEngine.playerId.set(playerEvent.playerId);
      this.gameEngine.session.set(playerEvent.session);
    });

    World.listen(this.socket).value.subscribe(
      async (val: {
        data: any;
        partial: any;
        time: number;
        roomId: string;
        resetProps: string[];
      }) => {
        if (!val.data) {
          return;
        }
        const change = (prop, root = val, localEvent = false) => {
          const list = root.data[prop];
          const partial = root.partial[prop];
          const isShape = prop == "shapes";
          if (!partial) {
            return;
          }
          if (val.resetProps.indexOf(prop) != -1) {
            // todo
          }
          for (let key in partial) {
            const obj = list[key];
            const paramsChanged = partial ? partial[key] : undefined;

            if (obj == null || obj.deleted) {
              // todo
              continue;
            }

            if (!obj) continue;

            this.gameEngine.updateObject({
              playerId: key,
              params: obj,
              localEvent,
              paramsChanged,
              isShape,
            });
          }
        };
        change("users");
        change("events");
        change("shapes");
      }
    );
  }

  get world(): any {
    return World;
  }

  /**
   * get player id of the current player
   * @prop {string} [playerId]
   * @readonly
   * @memberof RpgClientEngine
   */
  get playerId(): string {
    return this.gameEngine.playerId();
  }

  /**
   * Get the server url. This is the url for the websocket
   *
   * To customize the URL, use the `matchMakerService` configuration
   *
   * @title Server URL
   * @prop {string} [serverUrl] If empty string, server url is same as client url
   * @readonly
   * @memberof RpgClientEngine
   * @since 4.0.0
   */
  get serverUrl(): string {
    if (!this._serverUrl.startsWith("http")) {
      return "http://" + this._serverUrl;
    }
    return this._serverUrl;
  }

  get assetsPath(): string {
    return this.envs?.["VITE_ASSETS_PATH"] || "assets";
  }
}
