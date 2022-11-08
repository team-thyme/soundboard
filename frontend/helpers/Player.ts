import { Sample } from '../api';
import { OGVPlayer, OGVCompat, OGVLoader } from 'ogv';
import config from '../config';

interface PlayingData {
    instances: PlayingInstance[];
    analyserNode: AnalyserNode;
}

interface PlayingInstance {
    audioElement: HTMLAudioElement|OGVPlayer;

    // Used for extrapolating progress in browsers with low resolution player times
    lastPlayerTime: number;
    lastActualTime: number;
}

/**
 * Stops (pauses) all audio elements related to the given PlayingData.
 */
function stop(playingData: PlayingData) {
    playingData.instances.forEach(({ audioElement }) => {
        audioElement.pause();
    });
}

export interface TogglePlayOptions {
    spam?: boolean;
    loop?: boolean;
}

export default class Player {
    private audioContext: AudioContext;
    private gainNode: GainNode;

    private playing: Map<string, PlayingData> = new Map();
    private blockedSamples: { sample: Sample, options: TogglePlayOptions }[] = [];

    /**
     * Whether to use overcomplicated ogv.js backup audio source for expensive bricks without support for open formats
     * (Apple devices).
     */
    private useOgvFallback = false;

    /**
     * Whether to play a silent regular audio element before any real audio to have expensive bricks (again, iPhones) to
     * play them on the correct (media) channel instead of the ringer channel. Copy of
     * https://github.com/brion/ogv.js/blob/e0adc6189741ebf99ef19300bb52fa5f567eff77/src/js/OGVPlayer.js#L922-L927
     * but without creating an additional context which we want available _before_ the first play. TODO: Could use a PR.
     */
    private silencePlease = false;

    constructor() {
        this.audioContext = new AudioContext();

        // Configure OGV fallback.
        if (true || new Audio().canPlayType('audio/ogg;codecs=opus') === '') {
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

        // Create gain node
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        // TODO: add user setting for volume
        this.gainNode.gain.value = 0.1;
    }

    /**
     * Returns whether the sample with the given key is currently playing.
     */
    isPlaying(key: string): boolean {
        return this.playing.has(key);
    }

    /**
     * Returns the current progresses of each playing instance of the sample with
     * the given key, or [] if the sample is not currently playing.
     */
    getProgresses(key: string): number[] {
        const playingData = this.playing.get(key);
        if (playingData) {
            return playingData.instances.map((instance) => {
                let currentTime = Number(instance.audioElement.currentTime);
                const duration = Number(instance.audioElement.duration);
                if (!duration || !isFinite(duration)) {
                    return 0;
                }

                // If currentTime is the same as it was last frame(s), try to
                // extrapolate by considering the time that has passed since
                // the last update.
                if (
                    currentTime > 0 &&
                    currentTime === instance.lastPlayerTime
                ) {
                    currentTime =
                        instance.lastPlayerTime +
                        (Date.now() - instance.lastActualTime) / 1000;
                } else {
                    // New currentTime -> synchronize the instance
                    instance.lastPlayerTime = currentTime;
                    instance.lastActualTime = Date.now();
                }

                return currentTime / duration;
            });
        }
        return [];
    }

    /**
     * Returns the AnalyserNode for the sample with the given key, or null if
     * the sample is not currently playing. All playing instances of the sample
     * feed into the same AnalyserNode.
     */
    getAnalyserNode(key: string): AnalyserNode | null {
        return this.playing.get(key)?.analyserNode ?? null;
    }

    /**
     * Stops all playing instances of the sample with the given key.
     */
    stop(key: string) {
        const playingData = this.playing.get(key);
        if (playingData) {
            stop(playingData);
        }
    }

    /**
     * Stops all playing instances of all playing samples.
     */
    stopAll() {
        this.playing.forEach(stop);
    }

    playBlockedSamples(): void {
        const blockedSamples = [...this.blockedSamples];
        this.blockedSamples = [];
        blockedSamples.forEach(({ sample, options}) => {
            this.togglePlay(sample, options);
        });
    }

    /**
     * Toggles playing the given sample.
     *
     * The interaction of the `spam` option and the current playing state of the
     * sample is as follows:
     * - !spam && !playing => stop all samples, start playing the given sample
     * - !spam && playing => stop playing the given sample
     * - spam => start playing the given sample
     *
     * The `loop` option will simply set the new playing instance (be it spammed
     * or not) to loop indefinitely.
     */
    async togglePlay(
        sample: Sample,
        options: TogglePlayOptions = {},
    ) {
        const { key, url } = sample;
        const { spam = false, loop = false } = options;

        // No need to stop anything when spamming
        if (!spam) {
            if (this.isPlaying(key)) {
                player.stop(key);
                return;
            }
            player.stopAll();
        }

        // Resume context if it is suspended due to a lack of user input
        // Not awaited because that makes it hang indefinitely on Chrome on
        // Android...
        this.audioContext.resume();

        // Use existing analyser node or create a new one if this sample isn't
        // already playing.
        let analyserNode = this.getAnalyserNode(key);
        if (analyserNode === null) {
            analyserNode = this.audioContext.createAnalyser();
            analyserNode.fftSize = 2048;
            analyserNode.connect(this.gainNode);
        }

        let audio: HTMLAudioElement|OGVPlayer;
        if (this.useOgvFallback && url.match(/\.(ogg|webm)$/)) {
            audio = new OGVPlayer({
                audioContext: this.audioContext,
                audioDestination: analyserNode,
            });
            audio.src = url;
        } else {
            // Create an audio element source and link it to the context
            audio = new Audio(url);
            audio.crossOrigin = 'anonymous';
            const source = this.audioContext.createMediaElementSource(audio);
            source.connect(analyserNode);
        }

        audio.loop = loop; // Note: Does not work with OGVPlayer.

        let audioStopped = false;
        const handleStop = () => {
            if (!audioStopped) {
                audio.removeEventListener('pause', handleStop);
                audio.removeEventListener('ended', handleStop);

                // Unload the audio file
                audio.removeAttribute('src');
                audio.load();

                audioStopped = true;
            }

            const playingData = this.playing.get(key);
            if (!playingData) {
                return;
            }

            // Remove this audio element from the list
            playingData.instances = playingData.instances.filter(
                (instance) => instance.audioElement !== audio,
            );

            // Sample only fully ends once there are no more playing instances
            if (playingData.instances.length === 0) {
                this.playing.delete(key);
                this.emit('ended', key);
            }
        };

        audio.addEventListener('pause', handleStop);
        audio.addEventListener('ended', handleStop);

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
            handleStop();

            if (
                error instanceof DOMException &&
                error.name === 'NotAllowedError'
            ) {
                // Audio requires user interaction
                this.blockedSamples.push({ sample, options });
                this.emit('blocked', '*');
            }

            return;
        }

        // "Emplace" playingData with new audio element appended to the list
        const playingData = this.playing.get(key) ?? {
            instances: [],
            analyserNode,
        };
        playingData.instances.push({
            audioElement: audio,
            lastPlayerTime: -1,
            lastActualTime: -1,
        });
        this.playing.set(key, playingData);

        this.emit('play', key);
        this.watchProgressStart();
    }

    // Watch progress stuff
    private watchProgressRequestId: number | null = null;

    private watchProgressStart() {
        if (this.watchProgressRequestId === null) {
            this.watchProgressRequestId = window.requestAnimationFrame(
                this.watchProgress,
            );
        }
    }

    private watchProgress = () => {
        if (this.playing.size === 0) {
            this.watchProgressRequestId = null;
            return;
        }

        this.playing.forEach((playingData, key) => {
            // TODO: Add current progress as event argument
            this.emit('progress', key);
        });

        this.watchProgressRequestId = window.requestAnimationFrame(
            this.watchProgress,
        );
    };

    // Event stuff
    private eventTarget = new EventTarget();

    on(eventName: string, key: string, listener: any) {
        this.eventTarget.addEventListener(`${eventName} ${key}`, listener);
    }

    off(eventName: string, key: string, listener: any) {
        this.eventTarget.removeEventListener(`${eventName} ${key}`, listener);
    }

    private emit(eventName: string, key: string) {
        this.eventTarget.dispatchEvent(new Event(`${eventName} ${key}`));
    }
}

export const player = new Player();
