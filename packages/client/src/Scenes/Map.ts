import { TiledMap, Viewport, h } from "canvasengine";

export function SceneMap(props) {
    return h(Viewport, {
        clamp: {
            direction: 'all'
        },
        screenWidth: 800,
        screenHeight: 600,
        worldWidth: 40 * 32,
        worlHeight: 40 * 32,
    }, h(TiledMap, {
        map: './maps/map.tmx',
        objectLayer: (layer) => {

        }
    }),)
}