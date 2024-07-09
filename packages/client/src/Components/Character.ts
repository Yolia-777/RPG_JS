import { Control } from "@rpgjs/types";
import { Container, Sprite, signal } from "canvasengine";
import { GameEngineClient } from "../GameEngine";
import { spritesheets } from "../Resources";
import { inject } from "../inject";

export function CharacterComponent(props) {
  const graphic = props.layout?.center.lines[0].col[0].value;
  const { direction, x, y } = props;
  const game = inject(GameEngineClient);
  if (!graphic) {
    return Container();
  }

  const controls = signal({
    down: {
      repeat: true,
      bind: "down",
      trigger() {
        //y.update((y) => y + 3);
        game.player()?.pendingMove.push({
          input: Control.Down,
          frame: 0
        })
      },
    },
    up: {
      repeat: true,
      bind: "up",
      trigger() {
        y.update((y) => y - 3);
      },
    },
    left: {
      repeat: true,
      bind: "left",
      trigger() {
        x.update((x) => x - 3);
      },
    },
    right: {
      repeat: true,
      bind: "right",
      trigger() {
        x.update((x) => x + 3);
      },
    },
  });

  const spritesheet = spritesheets.get(graphic);

  return Sprite({
    sheet: {
      definition: spritesheet.$decorator,
      playing: "stand",
      params: {
        direction
      }
    },
    controls: props.id == game.playerId() ? controls : undefined,
    x,
    y,
  });
}
