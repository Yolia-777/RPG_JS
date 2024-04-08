import { RpgPlugin, HookClient, Utils, InjectContext } from '@rpgjs/common'
import { Canvas, computed, cond, h, signal } from 'canvasengine';
import { SceneMap } from './Scenes/Map';

const { elementToPositionAbsolute } = Utils

export enum TransitionMode {
    None,
    Fading
}

enum ContainerName {
    Map = 'map'
}

export const EVENTS_MAP = {
    MouseEvent: ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'contextmenu', 'wheel'],
    KeyboardEvent: ['keydown', 'keyup', 'keypress', 'keydownoutside', 'keyupoutside', 'keypressoutside'],
    PointerEvent: ['pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout', 'pointerenter', 'pointerleave', 'pointercancel'],
    TouchEvent: ['touchstart', 'touchend', 'touchmove', 'touchcancel']
};

export class RpgRenderer {
    private canvasEl: HTMLElement
    private selector: HTMLElement
    public guiEl: HTMLDivElement

    /** @internal */
    init(): Promise<void> {
        return this.onDOMLoaded()
    }

    /** @internal */
    async onDOMLoaded(): Promise<void> {
        const currentSceneName = signal('')
        await h(Canvas, {}, cond(
            computed(() => currentSceneName() == 'map'),
            SceneMap({})
        ))

        if (!this.guiEl) {
            this.guiEl = document.createElement('div')
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
}