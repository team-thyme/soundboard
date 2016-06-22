import { Howl, Howler } from 'howler';
import SettingsManager from './SettingsManager';

class Player {

  static instance;

  samples = [];
  playing = [];

  frameRequested = false;

  static init() {
    this.instance = new Player();

    SettingsManager.instance.on('volume', (volume) => Howler.volume(volume));
    Howler.volume(SettingsManager.instance.get('volume'));
  }

  constructor() {
    this.progressStep = this.progressStep.bind(this);
  }

  registerSample({ url, onPlay, onStop, onProgress }) {
    const sampleIndex = this.samples.length;

    const sample = {
      url,
      onPlay,
      onStop,
      onProgress,
    };

    // Prepare sound
    const howl = new Howl({
      src: [url],
      html5: true,
      preload: false,
    });

    sample.howl = howl;

    howl.on('play', (howlerId) => {
      // Check if this sound should still play
      if (this.playing[sampleIndex].includes(howlerId)) {
        onPlay();
      } else {
        howl.stop(howlerId);
      }

      // Request animation frame (only once)
      if (!this.frameRequested) {
        this.frameRequested = true;
        requestAnimationFrame(this.progressStep);
      }
    });

    howl.on('stop', (howlerId) => {
      // NOTE: This event can trigger even when a sound was already stopped

      // Remove the audio if it was registered as playing
      if (!howl.loop(howlerId) && this.playing[sampleIndex].includes(howlerId)) {
        this.playing[sampleIndex].splice(this.playing[sampleIndex].indexOf(howlerId), 1);

        // Only trigger onStop when the last sound has just been stopped
        if (this.playing[sampleIndex].length === 0) {
          onStop();
        }
      }
    });

    // Add to list
    this.samples.push(sample);
    this.playing.push([]);

    // Return the ID
    return sampleIndex;
  }

  isUnloaded(sampleIndex) {
    return this.samples[sampleIndex].howl.state() === 'unloaded';
  }

  load(id) {
    if (this.isUnloaded(id)) {
      this.samples[id].howl.load();
    }
  }

  play(sampleIndex, multiple = false, loop = false) {
    const sample = this.samples[sampleIndex];

    // Stop all sounds before playing if multiple are not allowed
    if (!multiple) {
      this.stopAll();
    }

    // Last-resort load
    this.load(sampleIndex);

    const howlerId = sample.howl.play();

    sample.howl.loop(loop, howlerId);

    this.playing[sampleIndex].push(howlerId);
  }

  stop(sampleIndex, howlerId = undefined) {
    if (this.samples[sampleIndex].howl.state() !== 'unloaded') {
      if (howlerId) {
        this.samples[sampleIndex].howl.loop(false, howlerId);
        this.samples[sampleIndex].howl.stop(howlerId);
      } else {
        this.samples[sampleIndex].howl.loop(false);
        this.samples[sampleIndex].howl.stop();
      }
    }
  }

  // TODO: stop runs after add, take this into account
  // play one, start slow loading and then another in rapid succession
  stopAll() {
    this.playing.forEach((playing, sampleIndex) => {
      if (playing.length > 0) {
        // Array is re-indexed on splice, so loop in reverse
        let i = playing.length;

        while (i-- > 0) {
          const howlerId = playing[i];

          this.stop(sampleIndex, howlerId);

          // Remove it from playing, so that the events can deal with the new state
          this.playing[sampleIndex].splice(this.playing[sampleIndex].indexOf(howlerId), 1);

          if (this.playing[sampleIndex].length === 0) {
            this.samples[sampleIndex].onStop();
          }
        }
      }
    });
  }

  progressStep() {
    const playingIndexes = [];
    this.playing.forEach((playing, sampleIndex) => {
      if (playing.length > 0) {
        playingIndexes.push(sampleIndex);
      }
    });

    if (playingIndexes.length > 0) {
      playingIndexes.forEach((sampleIndex) => {
        // Update using the latest howler id
        const howlerId = this.playing[sampleIndex][this.playing[sampleIndex].length - 1];

        const sample = this.samples[sampleIndex];
        const seek = sample.howl.seek(undefined, howlerId) || 0;
        const progress = (seek / sample.howl.duration()) * 100;

        sample.onProgress(progress);
      });

      requestAnimationFrame(this.progressStep);
    } else {
      this.frameRequested = false;
    }
  }
}

export default Player;
