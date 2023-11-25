import {CanvasController} from "./CanvasController";

export type VisualizerOptions = {
    stopOnPause?: boolean,
    clearOnStop?: boolean,
    falloff?: number,
    displayType?: DisplayType,
    resolution?: FftSize,
    barDistance?: number,
}

export enum DisplayType {
    Frequency,
    Time
}

// FftSize represents the window size in samples that is used when performing the FFT
// Must be a power of 2 between 2^5 and 2^15,
export enum FftSize {
    Size32 = 32,
    Size64 = 64,
    Size128 = 128,
    Size256 = 256,
    Size512 = 512,
    Size1024 = 1024,
    Size2048 = 2048,
    Size4096 = 4096,
    Size8192 = 8192,
    Size16384 = 16384,
    Size32768 = 32768,
}

/**
 *  Doc for analyser node:  https://webaudio.github.io/web-audio-api/#AnalyserNode
 */
export class Visualizer {

    private readonly ctx: CanvasRenderingContext2D
    private analyser: AnalyserNode | null = null
    private dataArray: Uint8Array | null = null
    private bufferLength: number = 0
    private animationFrameHandle = 0

    private stopOnPause = false
    private clearOnStop = false
    private falloff = 0.2
    private barDistance = 0.1
    private displayType = DisplayType.Time
    private resolution: FftSize = FftSize.Size256
    private canvasController: CanvasController
    private audio: HTMLAudioElement;

    private initialized: boolean = false


    constructor(audio: HTMLAudioElement, container: HTMLElement, options: VisualizerOptions) {
        this.audio = audio
        this.attachAudioListener(audio)
        this.canvasController = new CanvasController(container)
        this.ctx = this.canvasController.canvas.getContext("2d") as CanvasRenderingContext2D;

        this.applyOptions(options)

        this.resolution = FftSize.Size1024

        // TODO: the assignment of options to the internal properties and later to the analyzer node is a mess!
    }

    public init = () => {
        // (Interface) Audio-processing graph
        const context = new AudioContext();

        // Give the audio context an audio source, to which can then be played and manipulated
        const src = context.createMediaElementSource(this.audio);

        this.analyser = new AnalyserNode(context, {
            fftSize: this.resolution, // default: 2048 [Best for freq: 128, Best for time: 512]
            minDecibels: -100, // default: -100
            maxDecibels: -10, // default: -30
            smoothingTimeConstant: .7, // default: .8 (0 -> 1),
        })
        // this.applyResolution(128) // TODO: remove

        if (!this.dataArray) this.applyResolution(FftSize.Size1024)

        // Connects the audio context source to the analyser
        src.connect(this.analyser);

        // End destination of an audio graph in a given context
        // Sends sound to the speakers or headphones
        this.analyser.connect(context.destination);
        this.applyResolution(this.resolution)

        this.initialized = true
    }

    // TODO: options must be stored and not directly applied
    // TODO: remove bufferlength calculation from init method
    // TODO: re-enable 2 methods in apply resolution

    public change = (options: VisualizerOptions): void => {
        this.applyOptions(options)
    }

    private applyOptions(options: VisualizerOptions) {
        console.log(options);
        if (options.stopOnPause !== undefined) this.stopOnPause = options.stopOnPause
        if (options.clearOnStop !== undefined) this.clearOnStop = options.clearOnStop
        if (options.falloff !== undefined) this.falloff = options.falloff
        if (options.displayType !== undefined) this.displayType = options.displayType
        if (options.barDistance !== undefined) {
            this.barDistance = options.barDistance
        }
        // if (options.resolution && options.resolution !== this.resolution) {
        if (options.resolution)
            this.applyResolution(options.resolution)
        // }
    }

    private applyResolution = (resolution: FftSize) => {
        console.log('apply resolution', resolution);
        this.resolution = resolution
        if (this.analyser) {
            this.analyser.fftSize = resolution.valueOf()
            this.bufferLength = this.analyser.frequencyBinCount
        }

        // TODO !!!

        // TODO !!!
        // this.bufferLength = this.analyser.frequencyBinCount; // always half of the fft size

        // Unsigned integer, half of fftSize (so in this case, bufferLength = 8192)
        // Equates to number of data values you have to play with for the visualization

        // The FFT size defines the number of bins used for dividing the window into equal strips, or bins.
        // Hence, a bin is a spectrum sample, and defines the frequency resolution of the window.

        this.dataArray = new Uint8Array(this.bufferLength); // Converts to 8-bit unsigned integer array

    }

    private attachAudioListener = (audio: HTMLAudioElement) => {
        audio.onplay = () => this.start()
        audio.onpause = () => this.stop()
    }

    // while seeking, the audioelement send stop/start commands

    public start = () => {
        if(!this.initialized) this.init()
        console.log('start')
        //this.init()
        if (this.animationFrameHandle === 0)
            this.renderFrame()
    }

    public stop = () => {
        console.log('stop')
        if (this.stopOnPause && this.animationFrameHandle !== 0) {
            cancelAnimationFrame(this.animationFrameHandle)
            this.animationFrameHandle = 0
            if (this.clearOnStop)
                this.clearCanvas(1)
        }
    }

    private renderFrame = () => {
        this.animationFrameHandle = requestAnimationFrame(this.renderFrame); // Takes callback function to invoke before rendering
        this.clearCanvas(this.falloff)

        const width = this.ctx.canvas.width
        const height = this.ctx.canvas.height

        if (this.displayType === DisplayType.Frequency)
            this.renderFrequency(width, height)
        else if (this.displayType === DisplayType.Time)
            this.renderTime(width, height)

    }

    private renderFrequency = (width: number, height: number) => {
        if (this.dataArray && this.analyser) {
            // const numBars = this.bufferLength / 2
            const numBars = this.bufferLength / 2.5
            const barWidth = (width - (numBars - 1) * this.barDistance) / numBars

            this.analyser.getByteFrequencyData(this.dataArray); // Copies the frequency data into dataArray

            // Example with float:
            // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getFloatFrequencyData

            // Results in a normalized array of values between 0 and 255
            // Before this step, dataArray's values are all zeros (but with length of 8192)

            const rowHeight = height / 256  / 8

            let barHeight;
            for (let i = 0; i < numBars; i++) {
                const x = i * (barWidth + this.barDistance)
                barHeight = (this.dataArray[i] * rowHeight * Math.log2(i*2 +5));

                // for float based values (min/max db taken into account)
                // barHeight = (this.dataArray[i] + 90) / 80 * 200;

                let [r, g, b] = this.getColor(this.dataArray[i])

                this.ctx.fillStyle = `rgb(${r},${g},${b})`;
                this.ctx.fillRect(x, (height - barHeight), barWidth, barHeight);
            }
        }
    }

    private renderTime = (width: number, height: number) => {
        if (this.dataArray && this.analyser) {
        console.log('render frame', this.bufferLength)
            const numBars = this.bufferLength
            const barWidth = (width - (numBars - 1) * this.barDistance) / numBars
            this.analyser.getByteTimeDomainData(this.dataArray);
            const rowHeight = height / 256
            let barHeight;
            for (let i = 0; i < numBars; i++) {
                const x = i * (barWidth + this.barDistance)
                barHeight = this.dataArray[i] * rowHeight;

                // for float based values (min/max db taken into account)
                // barHeight = (this.dataArray[i] + 90) / 80 * this.HEIGHT;

                let [r, g, b] = this.getColor(this.dataArray[i])

                this.ctx.fillStyle = `rgb(${r},${g},${b})`;
                this.ctx.fillRect(x, (height - barHeight), barWidth, rowHeight);
            }
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
        return [255, 255, 77]
        // if (peak > 210) return [250, 0, 255] // pink
        // else if (peak > 200) return [250, 255, 0] // yellow
        // else if (peak > 190) return [204, 255, 0] // yellow/green
        // else if (peak > 180) return [0, 219, 131] // blue/green
        // else return [0, 199, 255] // light blue
    }
}
