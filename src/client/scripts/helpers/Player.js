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

  registerSample({ file, onPlay, onStop, onProgress }) {
    const id = this.samples.length;

    const sample = {
      file,
      onPlay,
      onStop,
      onProgress,
    };

    // Prepare sound
    const howl = new Howl({
      src: [encodeURI(file)],
      // html5: true, // Use HTML5 Audio, so large files can be streamed
      preload: false,
    });

    sample.howl = howl;

    howl.on('play', () => {
      // Avoid race conditions by checking if this sound should be playing right now
      if (!this.playing.includes(id)) {
        howl.stop();
      } else {
        onPlay();

        // Request animation frame only once
        if (!this.frameRequested) {
          this.frameRequested = true;
          requestAnimationFrame(this.progressStep);
        }
      }
    });

    howl.on('stop', () => {
      if (this.playing.indexOf(id) > -1) {
        this.playing.splice(this.playing.indexOf(id), 1);
      }
      onStop();
    });

    howl.on('end', () => {
      // Don't call stop when the sound is looping
      if (!howl.loop()) {
        howl.stop();
      }
    });

    // Add to list
    this.samples[id] = sample;

    // Return the ID
    return id;
  }

  isUnloaded(id) {
    return this.samples[id].howl.state() === 'unloaded';
  }

  load(id) {
    if (this.isUnloaded(id)) {
      this.samples[id].howl.load();
    }
  }

  play(id, multiple = false, loop = false) {
    const sample = this.samples[id];

    if (!multiple) {
      // Stop all other playing sounds
      this.playing = this.playing.filter((playingId) => {
        if (id !== playingId) {
          this.samples[playingId].howl.stop();
          return false;
        }
        return true;
      });
    }

    sample.howl.loop(loop);

    // Start playing the sample
    if (sample.howl.playing()) {
      // If the sample was already playing, just seek back to the start
      sample.howl.seek(0);
    } else {
      sample.howl.play();
      this.playing.push(id);
    }
  }

  stop(id) {
    const sample = this.samples[id];
    sample.howl.stop();
  }

  progressStep() {
    const { playing } = this;

    if (playing) {
      // Call the onProgress callback for each playing sample
      playing.forEach((id) => {
        const { howl, onProgress } = this.samples[id];

        const seek = howl.seek() || 0;
        const progress = (seek / howl.duration()) * 100;
        onProgress(progress);
      });

      requestAnimationFrame(this.progressStep);
    } else {
      this.frameRequested = false;
    }
  }

}

export default Player;
