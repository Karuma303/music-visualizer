/**
 * Creates a canvas in the given target container and watches for any size changes.
 */
export class CanvasController {

    private readonly _canvas: HTMLCanvasElement

    constructor(container: HTMLElement) {
        this._canvas = this.createCanvas(container)
        this.attachResizeObserver(container, this.canvas)
    }

    private createCanvas = (container: HTMLElement): HTMLCanvasElement => {
        const c: HTMLCanvasElement = document.createElement("canvas")
        c.id = 'canvas'
        c.style.position = 'absolute'
        container.appendChild(c)
        return c
    }

    private attachResizeObserver = (container: HTMLElement, canvas: HTMLCanvasElement) => {
        const resizeObserver = new ResizeObserver((items) => {
            const item: ResizeObserverEntry = items[0] // ugly
            if (canvas && item) {
                canvas.width = item.contentRect.width
                canvas.height = item.contentRect.height
            }
        })
        resizeObserver.observe(container)
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas
    }
}
