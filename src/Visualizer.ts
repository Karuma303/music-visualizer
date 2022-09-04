export class Visualizer {

    private readonly ctx: CanvasRenderingContext2D
    private readonly WIDTH: number
    private readonly HEIGHT: number
    private readonly analyser: AnalyserNode
    private readonly dataArray: Uint8Array
    private readonly barWidth: number
    private readonly bufferLength : number

    constructor(audio: HTMLAudioElement, ctx: CanvasRenderingContext2D) {
        // (Interface) Audio-processing graph
        const context = new AudioContext();


        // Give the audio context an audio source, to which can then be played and manipulated
        const src = context.createMediaElementSource(audio);

        // https://webaudio.github.io/web-audio-api/#AnalyserNode

        // const node = new AnalyserNode(context, {
        //     fftSize: 64,
        // })
        this.analyser = context.createAnalyser(); // Create an analyser for the audio context

        // Connects the audio context source to the analyser
        src.connect(this.analyser);

        // End destination of an audio graph in a given context
        // Sends sound to the speakers or headphones
        this.analyser.connect(context.destination);

        // (FFTSize) represents the window size in samples that is used when performing the FFT
        // Lower the size, the fewer bars (but wider)
        // Must be a power of 2 between 2^5 and 2^15,
        // so one of: 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, and 32768.
        // Defaults to 2048.
        this.analyser.fftSize = 128;

        // default is -100
        this.analyser.minDecibels = -90

        // default is -30
        this.analyser.maxDecibels = -10

        // 0 -> 1
        this.analyser.smoothingTimeConstant = 0.7

        this.bufferLength = this.analyser.frequencyBinCount; // always half of the fft size
        console.log('buffer len ' + this.bufferLength)
        // Unsigned integer, half of fftSize (so in this case, bufferLength = 8192)
        // Equates to number of data values you have to play with for the visualization

        // The FFT size defines the number of bins used for dividing the window into equal strips, or bins.
        // Hence, a bin is a spectrum sample, and defines the frequency resolution of the window.

        this.dataArray = new Uint8Array(this.bufferLength); // Converts to 8-bit unsigned integer array
        // At this point dataArray is an array with length of bufferLength but no values
        console.log('DATA-ARRAY: ', this.dataArray) // Check out this array of frequency values!

        this.WIDTH = ctx.canvas.width;
        this.HEIGHT = ctx.canvas.height;
        this.barWidth = (this.WIDTH / this.bufferLength * 2);

        this.ctx = ctx
        console.log(ctx)
    }

    public start = () => {
        this.renderFrame()
    }

    private renderFrame = () => {
        requestAnimationFrame(this.renderFrame); // Takes callback function to invoke before rendering

        let barHeight;
        let x = 0;

        this.analyser.getByteFrequencyData(this.dataArray); // Copies the frequency data into dataArray
        // Results in a normalized array of values between 0 and 255
        // Before this step, dataArray's values are all zeros (but with length of 8192)

        // use this for time based analysis
        // this.analyser.getByteTimeDomainData(this.dataArray); // Copies the frequency data into dataArray

        this.ctx.fillStyle = 'rgba(0,0,0,0.2)'; // Clears canvas before rendering bars (black with opacity 0.2)
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT); // Fade effect, set opacity to 1 for sharper rendering of bars

        let bars = this.bufferLength / 2 // Set total number of bars you want per frame
        const rowHeight = this.HEIGHT / 256

        for (let i = 0; i < bars; i++) {
            // barHeight = (this.dataArray[i] * 2.5);
            barHeight = this.dataArray[i] * rowHeight;
            let [r, g, b] = this.getColor(this.dataArray[i])

            this.ctx.fillStyle = `rgb(${r},${g},${b})`;
            this.ctx.fillRect(x, (this.HEIGHT - barHeight), this.barWidth - 10, barHeight);

            // Gives 10px space between each bar
            x += this.barWidth
        }
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
