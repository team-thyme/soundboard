import { Sample } from '../api';

interface PlayingData {
    audio: HTMLAudioElement;
    analyserNode: AnalyserNode;
}

export default class Player {
    private audioContext: AudioContext;
    private gainNode: GainNode;

    private playing: Map<string, PlayingData> = new Map();

    constructor() {
        this.audioContext = new AudioContext();

        // Create gain node
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        // TODO: add user setting for volume
        this.gainNode.gain.value = 0.1;
    }

    isPlaying(key: string): boolean {
        return this.playing.has(key);
    }

    getProgress(key: string): number {
        const playingData = this.playing.get(key);
        if (playingData) {
            return playingData.audio.currentTime / playingData.audio.duration;
        }
        return 0;
    }

    getAnalyserNode(key: string): AnalyserNode {
        return this.playing.get(key)?.analyserNode;
    }

    stop(key: string) {
        const playingData = this.playing.get(key);
        if (playingData) {
            playingData.audio.pause();
        }
    }

    stopAll() {
        this.playing.forEach((playingData) => {
            playingData.audio.pause();
        });
    }

    async play({ key, url }: Sample) {
        if (this.isPlaying(key)) {
            this.stop(key);
        }

        // Resume context if it is suspended due to a lack of user input
        // Not awaited because that makes it hang indefinitely on Chrome on
        // Android...
        this.audioContext.resume();

        const analyserNode = this.audioContext.createAnalyser();
        analyserNode.fftSize = 2048;
        analyserNode.connect(this.gainNode);

        const audio = new Audio(url);
        audio.crossOrigin = 'anonymous';
        const source = this.audioContext.createMediaElementSource(audio);
        source.connect(analyserNode);

        const handleStop = () => {
            if (this.isPlaying(key)) {
                audio.removeAttribute('src');
                audio.load();
                this.playing.delete(key);
                this.emit('ended', key);
            }
        };

        audio.addEventListener('pause', handleStop);
        audio.addEventListener('ended', handleStop);

        await audio.play();

        this.playing.set(key, {
            audio,
            analyserNode,
        });
        this.emit('play', key);
        this.watchProgressStart();
    }

    // Watch progress stuff
    private watchProgressRequestId: number = null;
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
