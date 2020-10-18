import * as PIXI from 'pixi.js'
import { Utils } from '@rpgjs/common'
import ImageLayer from './ImageLayer'
import TileLayer from './TileLayer'
import TileSet from './TileSet'

const { intersection } = Utils

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

export default class TileMap extends PIXI.Container {

    background: PIXI.Graphics = new PIXI.Graphics()
    eventsLayers: any = {}
    defaultLayer: any = null
    data
    _width: number = 0
    _height: number = 0
    tileWidth: number = 0 
    tileHeight: number = 0
    tileSets: any[] = []
    layers: any = {}

    constructor(data, private renderer) {
        super()
        this.x = 0
        this.y = 0
        this.create(data)
    }

    getEventLayer(name) {
        return this.eventsLayers[name] || this.defaultLayer
    }

    createEventLayer(name) {
        const container = this.eventsLayers[name] = new PIXI.Container()
        container.sortableChildren = true
        this.addChild(container)
        return container
    }

    private create(data) {
        this.data = data
        Object.assign(this, data)

        this.background.beginFill(0x00000);
        this.background.drawRect(
            0,
            0,
            (this._width || 0) * (this.tileWidth || 0),
            (this._height || 0) * (this.tileHeight || 0)
        );
        this.background.endFill();
        this.addChild(this.background);

        this.tileSets = this.tileSets.map((tileSet) => {
            return new TileSet(tileSet)
        })
    }

    createOverlayTiles(x, y, instance) {
        const tilesLayer: any = []
        this.data.layers.forEach((layerData) => {
            switch (layerData.type) {
                case 'tile': {
                    const tileLayer = new TileLayer(layerData, this.tileSets)
                    const tile = tileLayer.createTile(x, y, {
                        real: true,
                        filter: (tile) => {
                            const { data, y, z: zObject, height } = instance
                            const { hHitbox } = data
                            const { z } = tile.properties
                            if (z === undefined) return false
                            // is front of tile
                            if (y + hHitbox > tile.y + tile.height) {
                                const realZ = z * tile.height
                                const zIntersection = intersection([zObject, zObject + height], [realZ, realZ + tile.height])
                                if (!zIntersection) {
                                    return true
                                }
                                return false
                            }
                            return true
                        }
                    })
                    if (tile) {
                        tileLayer.addChild(tile)
                        tilesLayer.push(tileLayer)
                    }
                    break;
                }
            }
        })
        return tilesLayer
    }

    load() {
        this.defaultLayer = null
        this.removeChildren()

        this.tileSets.forEach(tileset => tileset.load())

        this.data.layers.forEach((layerData) => {
            layerData.map = this
            switch (layerData.type) {
                case 'tile': {
                    const tileLayer = new TileLayer(layerData, this.tileSets)
                    tileLayer.create()
                    this.layers[layerData.name] = tileLayer
                    this.addChild(tileLayer)
                    break;
                }
                case 'image': {
                    const imageLayer = new ImageLayer(layerData, /** TODO */ null);
                    this.layers[layerData.name] = imageLayer
                    this.addChild(imageLayer)
                    break;
                }
                case 'object': {
                   // this.defaultLayer = this.createEventLayer(layerData.name)
                    break;
                }
            }
        })

        if (!this.defaultLayer) {
            this.defaultLayer = this.createEventLayer('event-layer')
        }
    }
}