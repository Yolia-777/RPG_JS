import { RpgCommonGame, RpgCommonPlayer } from "@rpgjs/common";
import { ComputedSignal, computed, signal } from "canvasengine";

export class GameEngineClient extends RpgCommonGame {
  playerId = signal("");
  session = signal("");
  objects = signal<any[]>([]);
  player: ComputedSignal<RpgCommonPlayer | null> = computed(() => this.objects().find(object => object.id == this.playerId()))

  animationX: any;
  animationY: any;

  async updateObject(obj) {
    const { playerId: id, params, localEvent, paramsChanged, isShape } = obj;
    const findObject = this.objects().find((o: any) => o.id == id);
    if (!findObject) {
      const value = {
        id,
        ...params,
        x: signal(params.position?.x ?? params.x),
        y: signal(params.position?.y ?? params.y),
        direction: signal(params.direction),
      }
      this.objects.mutate((objs) =>
        objs.push(value)
      );
      
    } else {
      if (paramsChanged.position?.x) {
        if (this.animationX) {
          this.animationX.stop();
        }
        this.animationX = findObject.x.animate(
          paramsChanged.position?.x ?? params.x,
          {
            duration: 50,
          }
        );
      }
      if (paramsChanged.position?.y) {
        if (this.animationY) {
          this.animationY.stop();
        }
        this.animationY = findObject.y.animate(
          paramsChanged.position?.y ?? params.y,
          {
            duration: 50,
          }
        );
      }
      if (paramsChanged.direction !== undefined) {
        findObject.direction.set(paramsChanged.direction);
      }
    }
  }
}
