import './style.css'
import {Visualizer} from "./Visualizer";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
`

const file = document.getElementById("file-input") as HTMLInputElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const h3 = document.getElementById('name')
const audio = document.getElementById("audio") as HTMLAudioElement;

if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (file) file.onchange = () => {
        console.log('file changed')
        const files = file.files; // FileList containing File objects selected by the user (DOM File API)
        if (files) {
            console.log('FILES[0]: ', files[0])
            audio.src = URL.createObjectURL(files[0]); // Creates a DOMString containing the specified File object
            if (h3) {
                const name = files[0].name
                h3.innerText = `${name}` // Sets <h3> to the name of the file
            }
            const visualizer = new Visualizer(audio, ctx)
            visualizer.start()
            audio.play()
        }
    }
}
