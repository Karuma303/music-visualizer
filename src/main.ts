import './assets/style.css'
import {DisplayType, FftSize, Visualizer, VisualizerOptions} from "./Visualizer";

const file = document.getElementById("file-input") as HTMLInputElement;
const title = document.getElementById('name') as HTMLElement
const audio = document.getElementById("audio") as HTMLAudioElement;
const frequencyButton = document.getElementById('btn-frequency') as HTMLButtonElement
const timeButton = document.getElementById('btn-time') as HTMLButtonElement
const visualizerTarget = document.getElementById('visualizer') as HTMLElement

// NEXT
// - [ ] make color configurable
// - [ ] make gap between bars configurable
// - [ ] Round everything to integer positions (and dimensions)
// - [ ] make smoothing time constant configurable
// - [ ] Clean up CSS

// frequency fft - shows bars
const frequencyOptions: VisualizerOptions = {
    displayType: DisplayType.Frequency,
    stopOnPause: false,
    clearOnStop: false,
    falloff: .6,
    resolution: FftSize.Size256,
    barDistance: 4,
}

// time domain fft - shows waves
const timeOptions: VisualizerOptions = {
    displayType: DisplayType.Time,
    stopOnPause: false,
    clearOnStop: false,
    falloff: 1,
    resolution: FftSize.Size1024,
    barDistance: 0,
}

file.onchange = () => {
    const files = file.files;
    if (files) {
        audio.src = URL.createObjectURL(files[0]); // Creates a DOMString containing the specified File object
        const name = files[0].name
        title.innerText = `${name}` // Sets <h3> to the name of the file
        void audio.play()
    }
}

const visualizer = new Visualizer(audio, visualizerTarget, frequencyOptions)

frequencyButton.onclick = () => visualizer.change(frequencyOptions)
timeButton.onclick = () => visualizer.change(timeOptions)
