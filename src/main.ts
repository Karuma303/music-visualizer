import './assets/style.css'
import {DisplayType, FftSize, Visualizer, VisualizerOptions} from "./Visualizer";

const file = document.getElementById("file-input") as HTMLInputElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const main = document.getElementById("main") as HTMLElement;
const title = document.getElementById('name')
const audio = document.getElementById("audio") as HTMLAudioElement;
const frequencyButton = document.getElementById('btn-frequency') as HTMLButtonElement
const timeButton = document.getElementById('btn-time') as HTMLButtonElement
const visContainer = document.getElementById('vis-container') as HTMLDivElement

// NEXT
// - [ ] make color configurable
// - [ ] make gap between bars configurable
// - [ ] Round everything to integer positions (and dimensions)
// - [ ] make smoothing time constant configurable

const resizeObserver = new ResizeObserver((items) => {
    const item: ResizeObserverEntry = items[0] // ugly
    if (canvas && item) {
        canvas.width = item.contentRect.width
        canvas.height = item.contentRect.height
    }
})
resizeObserver.observe(visContainer)

const resize = () => {
    const rect = visContainer.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
}

// bars
const frequencyOptions: VisualizerOptions = {
    stopOnPause: false,
    clearOnStop: false,
    falloff: .6,
    displayType: DisplayType.Frequency,
    resolution: FftSize.Size256,
    barDistance: 4,
}

// waves
const timeOptions: VisualizerOptions = {
    stopOnPause: false,
    clearOnStop: false,
    falloff: 1,
    displayType: DisplayType.Time,
    resolution: FftSize.Size1024,
    barDistance: 0,
}

if (canvas) {
    if (frequencyButton) {
        frequencyButton.onclick = () => {
            if (visualizer) visualizer.change(frequencyOptions)
        }
    }

    if (timeButton) {
        timeButton.onclick = () => {
            if (visualizer) visualizer.change(timeOptions)
        }
    }

    if (main) {
        console.log('vis ' + visContainer)
        console.log(visContainer)
        visContainer.onresize = resize
        // window.onresize = resize
    }
    audio.onplay = () => {
        console.log('play')
        visualizer.start()
    }
    audio.onpause = () => {
        console.log('pause')
        visualizer.stop()
    }
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const visualizer = new Visualizer(audio, ctx, frequencyOptions)
    if (file) file.onchange = () => {
        const files = file.files; // FileList containing File objects selected by the user (DOM File API)
        if (files) {
            audio.src = URL.createObjectURL(files[0]); // Creates a DOMString containing the specified File object
            if (title) {
                const name = files[0].name
                title.innerText = `${name}` // Sets <h3> to the name of the file
            }
            audio.play()
        }
    }
}
