import { InjectContext } from "@rpgjs/common";
import { SocketEvents } from "@rpgjs/types";
import { World } from 'simple-room-client';
import { RpgRenderer } from "./Renderer";

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
   * @deprecated Use `inject(RpgRenderer)` instead. Will be removed in v5
   * @memberof RpgClientEngine
   * */
  public renderer: RpgRenderer;

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
        // token: this.session,
      },
      ...(globalConfig.socketIoClient || {}),
    });

    this.socket.on(SocketEvents.LoadScene, ({ name, data }) => {
      this.renderer.loadScene(name, data);
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

        const partialRoom = val.partial;

        const objectsChanged = {};

        const change = (prop, root = val, localEvent = false) => {
          const list = root.data[prop];
          const partial = root.partial[prop];
          const isShape = prop == "shapes";
          if (!partial) {
            return;
          }
          for (let key in partial) {
            const obj = list[key];
            const paramsChanged = partial ? partial[key] : undefined;

            console.log(obj)
           
          }
        };


        change("users");
        change("events");
        change("shapes");
      }
    );
  }
}
