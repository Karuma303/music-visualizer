export type VisualizerOptions = {
    stopOnPause?: boolean,
    clearOnStop?: boolean,
    falloff?: number
}

export class Visualizer {

    private readonly ctx: CanvasRenderingContext2D
    // private readonly WIDTH: number
    // private readonly HEIGHT: number
    private readonly analyser: AnalyserNode
    private readonly dataArray: Uint8Array
    // private readonly barWidth: number
    private readonly bufferLength: number
    private animationFrameHandle = 0

    private stopOnPause = false
    private clearOnStop = false
    private falloff = .2

    constructor(audio: HTMLAudioElement, ctx: CanvasRenderingContext2D, options?: VisualizerOptions) {

        if (options) {
            if (options.stopOnPause !== undefined) this.stopOnPause = options.stopOnPause
            if (options.clearOnStop !== undefined) this.clearOnStop = options.clearOnStop
            if (options.falloff !== undefined) this.falloff = options.falloff
        }

        // (Interface) Audio-processing graph
        const context = new AudioContext();

        // Give the audio context an audio source, to which can then be played and manipulated
        const src = context.createMediaElementSource(audio);

        // https://webaudio.github.io/web-audio-api/#AnalyserNode

        // Example with float:
        // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getFloatFrequencyData

        // fftSize represents the window size in samples that is used when performing the FFT
        // Must be a power of 2 between 2^5 and 2^15,
        // so one of: 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768.
        this.analyser = new AnalyserNode(context, {
            fftSize: 128, // default: 2048
            minDecibels: -90, // default: -100
            maxDecibels: -10, // default: -30
            smoothingTimeConstant: .8 // default: .8
        })
        // this.analyser = context.createAnalyser(); // Create an analyser for the audio context

        // Connects the audio context source to the analyser
        src.connect(this.analyser);

        // End destination of an audio graph in a given context
        // Sends sound to the speakers or headphones
        this.analyser.connect(context.destination);

        // 0 -> 1
        this.analyser.smoothingTimeConstant = 0.7

        this.bufferLength = this.analyser.frequencyBinCount; // always half of the fft size

        // Unsigned integer, half of fftSize (so in this case, bufferLength = 8192)
        // Equates to number of data values you have to play with for the visualization

        // The FFT size defines the number of bins used for dividing the window into equal strips, or bins.
        // Hence, a bin is a spectrum sample, and defines the frequency resolution of the window.

        this.dataArray = new Uint8Array(this.bufferLength); // Converts to 8-bit unsigned integer array


        this.ctx = ctx
    }

    public start = () => {
        if (this.animationFrameHandle === 0)
            this.renderFrame()
    }

    public stop = () => {
        if (this.stopOnPause && this.animationFrameHandle !== 0) {
            cancelAnimationFrame(this.animationFrameHandle)
            this.animationFrameHandle = 0
            if (this.clearOnStop)
                this.clearCanvas(1)
        }
    }

    private renderFrame = () => {
        this.animationFrameHandle = requestAnimationFrame(this.renderFrame); // Takes callback function to invoke before rendering
        const WIDTH = this.ctx.canvas.width
        const HEIGHT = this.ctx.canvas.height

        const barWidth = (WIDTH / this.bufferLength * 2);

        let barHeight;
        let x = 0;

        this.analyser.getByteFrequencyData(this.dataArray); // Copies the frequency data into dataArray
        // Results in a normalized array of values between 0 and 255
        // Before this step, dataArray's values are all zeros (but with length of 8192)

        // use this for time based analysis
        // this.analyser.getByteTimeDomainData(this.dataArray); // Copies the frequency data into dataArray

        this.clearCanvas(this.falloff)

        let bars = this.bufferLength / 2 // Set total number of bars you want per frame
        const rowHeight = HEIGHT / 256

        for (let i = 0; i < bars; i++) {
            barHeight = this.dataArray[i] * rowHeight;

            // for float based values (min/max db taken into account)
            // barHeight = (this.dataArray[i] + 90) / 80 * this.HEIGHT;

            let [r, g, b] = this.getColor(this.dataArray[i])

            this.ctx.fillStyle = `rgb(${r},${g},${b})`;
            this.ctx.fillRect(x, (HEIGHT - barHeight), barWidth - 10, barHeight);

            // Gives 10px space between each bar
            x += barWidth
        }
    }

    private clearCanvas(alpha: number) {
        const WIDTH = this.ctx.canvas.width
        const HEIGHT = this.ctx.canvas.height
        this.ctx.fillStyle = `rgba(0,0,0,${alpha.toString()})`; // Clears canvas before rendering bars (black with opacity 0.2)
        // this.ctx.fillStyle = 'rgba(0,0,0,1)'; // Clears canvas before rendering bars (black with opacity 0.2)
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT); // Fade effect, set opacity to 1 for sharper rendering of bars
    }

    private getColor(_: number): [number, number, number] {
        return [0, 199, 255]
        // if (peak > 210) return [250, 0, 255] // pink
        // else if (peak > 200) return [250, 255, 0] // yellow
        // else if (peak > 190) return [204, 255, 0] // yellow/green
        // else if (peak > 180) return [0, 219, 131] // blue/green
        // else return [0, 199, 255] // light blue
    }
}
