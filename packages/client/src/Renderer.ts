import { InjectContext, Utils } from "@rpgjs/common";
import { Canvas, computed, cond, h, signal } from "canvasengine";
import { SceneMap } from "./Scenes/Map";

const { elementToPositionAbsolute } = Utils;

export enum TransitionMode {
  None,
  Fading,
}

export type Scenes = {
  [key: string]: (...props) => any;
};

enum ContainerName {
  Map = "map",
}

export const EVENTS_MAP = {
  MouseEvent: [
    "click",
    "dblclick",
    "mousedown",
    "mouseup",
    "mousemove",
    "mouseenter",
    "mouseleave",
    "mouseover",
    "mouseout",
    "contextmenu",
    "wheel",
  ],
  KeyboardEvent: [
    "keydown",
    "keyup",
    "keypress",
    "keydownoutside",
    "keyupoutside",
    "keypressoutside",
  ],
  PointerEvent: [
    "pointerdown",
    "pointerup",
    "pointermove",
    "pointerover",
    "pointerout",
    "pointerenter",
    "pointerleave",
    "pointercancel",
  ],
  TouchEvent: ["touchstart", "touchend", "touchmove", "touchcancel"],
};

export class RpgRenderer {
  private canvasEl: HTMLElement;
  private selector: HTMLElement;
  private currentSceneName = signal("");
  private currentSceneData = signal({});
  private scenes = {};

  width = signal(800);
  height = signal(600);

  public guiEl: HTMLDivElement;

  constructor(private context: InjectContext, private options) {}

  /** @internal */
  init(scenes: Scenes): Promise<void> {
    this.scenes = {
      map: SceneMap,
      ...scenes,
    };
    return this.onDOMLoaded();
  }

  /** @internal */
  async onDOMLoaded(): Promise<void> {
    this.selector = document.body.querySelector(this.options.selector);
    this.canvasEl = this.selector.querySelector(this.options.selectorCanvas);

    await h(
      Canvas,
      {
        canvasEl: this.canvasEl,
        selector: this.options.selector,
        width: this.width,
        height: this.height
      },
      cond(
        computed(() => this.currentSceneName()),
        () => {
          const name = this.currentSceneName();
          const sceneFn = this.scenes[name];
          if (!sceneFn) {
            throw new Error(`Scene ${name} not found`);
          }
          return sceneFn(this.currentSceneData);
        }
      )
    );

    if (!this.guiEl) {
      this.guiEl = document.createElement("div");
      //this.guiEl = this.selector.appendChild(this.guiEl)
    }

    //elementToPositionAbsolute(this.guiEl)

    /*if (!this.canvasEl) {
            this.selector.insertBefore(this.renderer.view as HTMLCanvasElement, this.selector.firstChild)
            const [canvas] = document.querySelector(this.options.selector).children
            canvas.style.position = 'absolute'
        }
        else {
            this.canvasEl.appendChild(this.renderer.view as HTMLCanvasElement)
        }*/
  }

  loadScene(sceneName: string, data: any) {
    this.currentSceneData.set(data);
    this.currentSceneName.set(sceneName);
  }
}
