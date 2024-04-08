import { TiledMap as Map } from "@rpgjs/tiled";
import { Signal, TiledMap, h } from "canvasengine";
import { RpgRenderer } from "../Renderer";
import { inject } from "../inject";

export function SceneMap(props: Signal<Map>) {
  const { height, tileheight, width, tilewidth } = props();
  const renderer = inject(RpgRenderer);

  // TODO: Waiting Viewport to be implemented.
  /*return h(
    Viewport,
    {
      clamp: {
        direction: "all",
      },
      screenWidth: renderer.width,
      screenHeight: renderer.height,
      worldWidth: width * tilewidth,
      worlHeight: height * tileheight,
    },
    
  );*/
  return h(TiledMap, {
    map: props,
    objectLayer: (layer) => {},
  });
}
