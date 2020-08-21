import { Sample } from '../api';

interface PlayingData {
    audio: HTMLAudioElement;
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

        const audio = new Audio(url);
        audio.crossOrigin = 'anonymous';
        const source = this.audioContext.createMediaElementSource(audio);
        source.connect(this.gainNode);

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
        });
        this.emit('play', key);
    }

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
