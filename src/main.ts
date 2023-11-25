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
    falloff: .8,
    resolution: FftSize.Size512,
    barDistance: 0,
}

// time domain fft - shows waves
const timeOptions: VisualizerOptions = {
    displayType: DisplayType.Time,
    stopOnPause: false,
    clearOnStop: false,
    falloff: 2,
    resolution: FftSize.Size1024,
    barDistance: 0,
}

let fileList: FileList | null
let fileIndex = 0

file.onchange = () => {
    fileList = file.files;
    fileIndex = 0
    playNext()
}

audio.onended = () => {
    playNext()
}

const playNext = () => {
    if (fileList) {
        play(fileList[fileIndex])
        fileIndex = fileIndex + 1 % fileList.length
    }
}

const play = (file: File) => {
    audio.src = URL.createObjectURL(file); // Creates a DOMString containing the specified File object
    const name = file.name
    title.innerText = `${name}` // Sets <h3> to the name of the file
    void audio.play()
}

const visualizer = new Visualizer(audio, visualizerTarget, frequencyOptions)

frequencyButton.onclick = () => visualizer.change(frequencyOptions)
timeButton.onclick = () => visualizer.change(timeOptions)
