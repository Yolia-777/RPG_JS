import { InjectContext } from "@rpgjs/common"
import { RpgRenderer } from "./Renderer"

export class RpgClientEngine {
    /** 
     * Get the rendering 
     * 
     * @prop {RpgRenderer} [renderer]
     * @readonly
     * @deprecated Use `inject(RpgRenderer)` instead. Will be removed in v5
     * @memberof RpgClientEngine
     * */
    public renderer: RpgRenderer

    envs?: object = {}

    constructor(private context: InjectContext, private options) {
        this.envs = options.envs || {}
    }

    private async _init() {
        this.renderer = this.context.inject(RpgRenderer)
    }

    /**
     * Starts the client side and connects to the server
     *
     * @title Start Client Engine
     * @method start()
     * @returns {Promise< RpgClientEngine >}
     * @memberof RpgClientEngine
     */
    async start(options: { renderLoop: boolean } = {
        renderLoop: true
    }): Promise<RpgClientEngine> {
        await this._init()
        await this.renderer.init()
        return this
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

    }
}
