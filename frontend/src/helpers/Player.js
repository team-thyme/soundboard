import $ from 'jquery';
import SettingsManager from './SettingsManager';
import Modal from '../components/Modal';
import { OGVPlayer, OGVCompat, OGVLoader } from 'ogv';
import config from '../config';

/**
 * @typedef {Object} Sample
 * @property {(loop: Boolean) => Promise<Boolean>} play
 * @property {String} url
 * @property {() => void} onPlay
 * @property {() => void} onStop
 * @property {(progress: Number) => void} onProgress
 */

export default class Player {
    /** @type {Player} */
    static instance;

    /**
     * The registered samples.
     *
     * @type {Sample[]}
     */
    samples = [];

    /**
     * An array of audio nodes that are currently playing per sample.
     *
     * @type {HTMLAudioElement[][]}
     */
    playing = [];

    /** @type {Boolean} */
    samplesArePlaying = false;

    /**
     * Used to create audio sources and as destination for the playing samples.
     *
     * @type {AudioContext}
     */
    audioContext = new AudioContext({
        latencyHint: 'interactive',
        // Samples are generally 48kHz but any resampling (setting this to a value other than 48000) somehow fixes crazy
        // stuttering on my device on Firefox mobile. ¯\_(ツ)_/¯
        sampleRate: 48_001,
    });

    // The audio node to connect the created audio to
    audioDestinationNode;

    // When samples are blocked from playing due to browser policies, they end
    // up here: [{sample, loop}]
    /** @type {{sample: Sample, loop: Boolean}[]} */
    blockedSamples = [];

    /**
     * The function assigned to this property will be called when a sample is blocked from playing.
     *
     * @type {(() => void)|null}
     */
    onBlocked = null;

    /**
     * Whether to use overcomplicated ogv.js backup audio source for expensive bricks without support for open formats
     * (Apple devices).
     *
     * @type {Boolean}
     */
    useOgvFallback = false;

    /**
     * Whether to play a silent regular audio element before any real audio to have expensive bricks (again, iPhones) to
     * play them on the correct (media) channel instead of the ringer channel. Copy of
     * https://github.com/brion/ogv.js/blob/e0adc6189741ebf99ef19300bb52fa5f567eff77/src/js/OGVPlayer.js#L922-L927
     * but without creating an additional context which we want available _before_ the first play. TODO: Could use a PR.
     *
     * @type {Boolean}
     */
    silencePlease = false;

    static init() {
        this.instance = new Player();
    }

    constructor() {
        // Configure OGV fallback.
        if (new Audio().canPlayType('audio/ogg;codecs=opus') === '') {
            console.info('OGG/Opus not supported. Initializing OGV...');

            if (OGVCompat.supported('OGVPlayer')) {
                this.useOgvFallback = true;
                this.silencePlease = true;
                OGVLoader.base = `${config.baseUrl}ogv`;
            } else {
                console.warn('No support for Opus audio or OGV. Falling back to native playback.');
            }
        } else {
            console.info('Using native audio playback for OGG/Opus. Thanks for using a real browser!');
        }

        // Set up volume control using a gain node
        const gainNode = this.audioContext.createGain();
        gainNode.connect(this.audioContext.destination);

        // Initial volume
        gainNode.gain.value = SettingsManager.instance.get('volume');

        // Bind to volume changes
        SettingsManager.instance.on('volume', (volume) => {
            gainNode.gain.value = volume;
        });

        this.audioDestinationNode = gainNode;

        // Stop playing everything on space (except when a modal is active)
        $(window).on('keydown', (e) => {
            if (e.which === 32 && !Modal.isModalActive()) {
                e.preventDefault();
                this.stopAll();
            }
        });
    }

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
            // Resume context if it is suspended due to a lack of user input
            // Not awaited because that makes it hang indefinitely on Chrome on
            // Android...
            this.audioContext.resume();

            /** @type {HTMLAudioElement|OGVPlayer} */
            let audio;
            if (this.useOgvFallback && url.match(/\.(ogg|webm)$/)) {
                audio = new OGVPlayer({
                    audioContext: this.audioContext,
                    audioDestination: this.audioDestinationNode,
                });
                audio.src = url;
            } else {
                // Create an audio element source and link it to the context
                audio = new Audio(url);
                audio.crossOrigin = 'anonymous';
                const source = this.audioContext.createMediaElementSource(audio);
                source.connect(this.audioDestinationNode);
            }

            audio.loop = loop; // Note: Does not work with OGVPlayer.

            // Add to playing
            this.playing[sampleIndex].push(audio);

            // Stop audio when play failed or it has ended
            const stop = () => {
                const audioIndex = this.playing[sampleIndex].indexOf(audio);

                if (audioIndex >= 0) {
                    // Remove from playing
                    this.playing[sampleIndex].splice(audioIndex, 1);

                    // Trigger onStop only when we just removed the last playing instance of this sample
                    if (this.playing[sampleIndex].length === 0) {
                        sample.onStop();
                    }
                }
            };

            audio.onpause = stop;
            audio.onended = stop;

            try {
                // First try playing the most silent audio you've ever heard. Should trigger same not allowed error
                // handling upon failure to deal with playing from URL.
                if (this.silencePlease) {
                    const silence = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU5LjE2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAAEEwCZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ//////////////////////////////////////////////////////////////////8AAAAATGF2YzU5LjE4AAAAAAAAAAAAAAAAJAZAAAAAAAAABBMIw3vfAAAAAAAAAAAAAAAAAAAAAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7kmRAj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=');
                    await silence.play();
                    this.silencePlease = false;
                    console.info('Did you hear that? I thought I heard something.'); // "Must have been my imagination."
                }

                await audio.play();
            } catch (error) {
                stop();

                if (
                    error instanceof DOMException &&
                    error.name === 'NotAllowedError'
                ) {
                    // Audio requires user interaction
                    this.blockedSamples.push({sample, loop});
                    this.onBlocked?.();
                }

                return false;
            }

            // Trigger onPlay only when this is the first instance of this sample to start playing
            if (this.playing[sampleIndex].length === 1) {
                sample.onPlay();

                // Request animation frame (only once)
                if (!this.samplesArePlaying) {
                    this.samplesArePlaying = true;
                    requestAnimationFrame(this.progressStep);
                }
            }

            return true;
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
                const currentTime = Number(playing[playing.length - 1].currentTime);
                const duration = Number(playing[playing.length - 1].duration);
                if (duration && isFinite(duration)) {
                    const progress = (currentTime / duration) * 100;
                    this.samples[sampleIndex].onProgress(progress);
                }

                samplesArePlaying = true;
            }
        });

        // Keep requesting an animation frame until no samples are playing
        this.samplesArePlaying = samplesArePlaying;
        if (this.samplesArePlaying) {
            window.requestAnimationFrame(this.progressStep);
        }
    };

    isPlaying(sampleIndex) {
        return this.playing[sampleIndex].length > 0;
    }
}
