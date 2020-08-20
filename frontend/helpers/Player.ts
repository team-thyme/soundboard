import { Sample } from '../api';

export default class Player {
    private audioContext: AudioContext;
    private gainNode: GainNode;

    constructor() {
        this.audioContext = new AudioContext();

        // Create gain node
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        // TODO: add user setting for volume
        this.gainNode.gain.value = 0.1;
    }

    async play({ url }: Sample) {
        // Resume context if it is suspended due to a lack of user input
        // Not awaited because that makes it hang indefinitely on Chrome on
        // Android...
        this.audioContext.resume();

        const audio = new Audio(url);
        audio.crossOrigin = 'anonymous';
        const source = this.audioContext.createMediaElementSource(audio);
        source.connect(this.gainNode);

        await audio.play();
    }
}

export const player = new Player();
