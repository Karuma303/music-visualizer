import './assets/style.css'
import {Visualizer} from "./Visualizer";

const file = document.getElementById("file-input") as HTMLInputElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const main = document.getElementById("main") as HTMLElement;
const title = document.getElementById('name')
const audio = document.getElementById("audio") as HTMLAudioElement;

// NEXT
// - [ ] show time domain

const resize = () => {
    if (canvas.parentNode) {
        const rect = (canvas.parentNode as HTMLElement).getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
}

if (canvas) {
    if (main) {
        window.onresize = resize
        resize()
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
    const visualizer = new Visualizer(audio, ctx, {stopOnPause: false, clearOnStop: false, falloff: .2})
    // visualizer.start()
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
