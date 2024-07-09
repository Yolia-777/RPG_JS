import { TiledMap as Map } from "@rpgjs/tiled";
import { Signal, TiledMap, h, loop } from "canvasengine";
import { CharacterComponent } from "../Components/Character";
import { GameEngineClient } from "../GameEngine";
import { RpgRenderer } from "../Renderer";
import { inject } from "../inject";

export function SceneMap(props: Signal<Map>) {
  const { height, tileheight, width, tilewidth } = props();
  const renderer = inject(RpgRenderer);
  const game = inject(GameEngineClient);

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
    objectLayer: (layer) => {
      return loop(game.objects, (object, index) => {
        return h(CharacterComponent, object)
      })
    },
  });
}
