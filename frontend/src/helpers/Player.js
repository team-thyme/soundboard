import $ from 'jquery';
import SettingsManager from './SettingsManager';
import Modal from '../components/Modal';
import { OGVPlayer, OGVCompat, OGVVersion, OGVLoader } from 'ogv';

export default class Player {
    static instance;

    // The registered samples
    samples = [];

    // An array of audio nodes that are currently playing per sample
    playing = [];

    // Used to create audio sources and as destination for the playing samples
    audioContext = new AudioContext();

    // The audio node to connect the created audio to
    audioDestinationNode;

    // Whether an animation frame is requested, indicating that no new loop has to be spawned
    frameRequested = false;

    // When samples are blocked from playing due to browser policies, they end
    // up here: [{sample, loop}]
    blockedSamples = [];

    /**
     * The function assigned to this property will be called when a sample is
     * blocked from playing.
     */
    onBlocked;

    newFangledOgvThingy;

    static init() {
        this.instance = new Player();
    }

    constructor() {
        if (!OGVCompat.supported('OGVPlayer')) {
            throw Error('No OGV support =(');
        }

        OGVLoader.base = '/build/ogv';

        const player = new OGVPlayer();
        player.volume = SettingsManager.instance.get('volume');
        SettingsManager.instance.on('volume', (volume) => {
            player.volume = volume;
        });

        this.newFangledOgvThingy = player;


        // // Set up volume control using a gain node
        // const gainNode = this.audioContext.createGain();
        // gainNode.connect(this.audioContext.destination);
        //
        // // Initial volume
        // gainNode.gain.value = SettingsManager.instance.get('volume');
        //
        // // Bind to volume changes
        // SettingsManager.instance.on('volume', (volume) => {
        //     gainNode.gain.value = volume;
        // });
        //
        // // Set the gain node as the destination node
        // this.audioDestinationNode = gainNode;
        //
        // // Stop playing everything on space (except when a modal is active)
        // $(window).on('keydown', (e) => {
        //     if (e.which === 32 && !Modal.isModalActive()) {
        //         e.preventDefault();
        //         this.stopAll();
        //     }
        // });
    }

    // TODO: Sample object
    registerSample(url, onPlay, onStop, onProgress) {
        const sample = {
            url,
            onPlay,
            onStop,
            onProgress,
        };

        const sampleIndex = this.samples.push(sample) - 1;
        this.playing[sampleIndex] = [];

        sample.play = async (loop) => {
            this.newFangledOgvThingy.src = sample.url;
            this.newFangledOgvThingy.play();


            // // Resume context if it is suspended due to a lack of user input
            // // Not awaited because that makes it hang indefinitely on Chrome on
            // // Android...
            // this.audioContext.resume();
            //
            // // Create an audio element source and link it to the context
            // const audio = new Audio(url);
            // audio.crossOrigin = 'anonymous';
            // const source = this.audioContext.createMediaElementSource(audio);
            // source.connect(this.audioDestinationNode);
            //
            // audio.loop = loop;
            //
            // // Add to playing
            // this.playing[sampleIndex].push(audio);
            //
            // // Stop audio when play failed or it has ended
            // const stop = () => {
            //     const audioIndex = this.playing[sampleIndex].indexOf(audio);
            //
            //     if (audioIndex >= 0) {
            //         // Remove from playing
            //         this.playing[sampleIndex].splice(audioIndex, 1);
            //
            //         // Trigger onStop only when we just removed the last playing instance of this sample
            //         if (this.playing[sampleIndex].length === 0) {
            //             sample.onStop();
            //         }
            //     }
            // };
            //
            // audio.onpause = stop;
            // audio.onended = stop;
            //
            // try {
            //     await audio.play();
            // } catch (error) {
            //     stop();
            //
            //     if (
            //         error instanceof DOMException &&
            //         error.name === 'NotAllowedError'
            //     ) {
            //         // Audio requires user interaction
            //         this.blockedSamples.push({sample, loop});
            //         this.onBlocked?.();
            //     }
            //
            //     return false;
            // }
            //
            // // Trigger onPlay only when this is the first instance of this sample to start playing
            // if (this.playing[sampleIndex].length === 1) {
            //     sample.onPlay();
            //
            //     // Request animation frame (only once)
            //     if (!this.frameRequested) {
            //         this.frameRequested = true;
            //
            //         requestAnimationFrame(this.progressStep);
            //     }
            // }
            //
            // return true;
        };

        // Return the ID
        return sampleIndex;
    }

    async play(sampleIndex, spam = false, loop = false) {
        // Stop all sounds before playing if multiple are not allowed
        if (!spam) {
            this.stopAll();
        }

        return this.samples[sampleIndex].play(loop);
    }

    playBlocked() {
        this.blockedSamples.forEach((blockedSample) => {
            blockedSample.sample.play(blockedSample.loop);
        });

        this.blockedSamples.length = 0;
    }

    stop(sampleIndex) {
        this.playing[sampleIndex].forEach((playing) => {
            playing.pause();
        });
    }

    stopAll() {
        this.playing.forEach((playing, sampleIndex) => {
            this.stop(sampleIndex);
        });
    }

    progressStep = () => {
        let samplesArePlaying = false;
        this.playing.forEach((playing, sampleIndex) => {
            if (playing.length > 0) {
                // Use the last playing sample to reflect the most recently started sample
                const progress = (playing[playing.length - 1].currentTime / playing[playing.length - 1].duration) * 100;
                this.samples[sampleIndex].onProgress(progress);

                samplesArePlaying = true;
            }
        });

        this.frameRequested = samplesArePlaying;

        // Keep requesting an animation frame until all no samples are playing
        if (this.frameRequested) {
            window.requestAnimationFrame(this.progressStep);
        }
    };

    isPlaying(sampleIndex) {
        return this.playing[sampleIndex].length > 0;
    }
}
