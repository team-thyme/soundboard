import SettingsManager from './SettingsManager';

class Player {
  static instance;

  // The registered samples
  samples = [];

  // An array of audio nodes that are currently playing per sample
  playing = [];

  // Used to create audio sources and as destination for the playing samples
  audioContext = new AudioContext();

  frameRequested = false;

  static init() {
    this.instance = new Player();
    this.instance.context = new AudioContext();

    // SettingsManager.instance.on('volume', (volume) => Howler.volume(volume));
    // Howler.volume(SettingsManager.instance.get('volume'));
  }

  constructor() {
    this.progressStep = this.progressStep.bind(this);
  }

  registerSample({ url, onPlay, onStop, onProgress }) {
    const sample = {
      url,
      onPlay,
      onStop,
      onProgress,
    };

    const sampleIndex = this.samples.push(sample) - 1;
    this.playing[sampleIndex] = [];

    const player = this;
    sample.play = function(loop) {
      // Create an audio element source and link it to the context
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      const source = player.audioContext.createMediaElementSource(audio);
      source.connect(player.audioContext.destination);

      audio.loop = loop;

      audio.play();

      // Add to playing
      player.playing[sampleIndex].push(audio);

      // Register audio stop event
      audio.onended = audio.onpause = function() {
        // Remove from playing
        player.playing[sampleIndex].splice(player.playing[sampleIndex].indexOf(audio), 1);

        sample.onStop();
      };

      sample.onPlay();

      // Request animation frame (only once)
      if (!this.frameRequested) {
        this.frameRequested = true;
        requestAnimationFrame(player.progressStep);
      }
    };

    // Return the ID
    return sampleIndex;
  }

  play(sampleIndex, multiple = false, loop = false) {
    // Stop all sounds before playing if multiple are not allowed
    if (!multiple) {
      this.stopAll();
    }

    this.samples[sampleIndex].play(loop);
  }

  stop(sampleIndex) {
    this.playing[sampleIndex].forEach(function(playing) {
      playing.pause();
    });
  }

  stopAll() {
    this.playing.forEach((playing, sampleIndex) => {
      this.stop(sampleIndex);
    });
  }

  progressStep() {
    // TODO: Make this work
    let frameRequested = false;
    this.playing.forEach((playing, sampleIndex) => {
      if (playing.length > 0) {
        const progress = playing[playing.length - 1].currentTime / playing[playing.length - 1].duration * 100;
        console.log(playing[playing.length - 1].duration);
        this.samples[sampleIndex].onProgress(progress);

        frameRequested = true;
      }
    });

    if (frameRequested) {
      this.frameRequested = true;
    }


    // if (playingIndexes.length > 0) {
    //   playingIndexes.forEach((sampleIndex) => {
    //     // Update using the latest howler id
    //     const howlerId = this.playing[sampleIndex][this.playing[sampleIndex].length - 1];
    //
    //     const sample = this.samples[sampleIndex];
    //     const seek = sample.howl.seek(undefined, howlerId) || 0;
    //     const progress = (seek / sample.howl.duration()) * 100;
    //
    //     sample.onProgress(progress);
    //
    //     frameRequested = true;
    //   });
    //
    //   if (frameRe)
    //
    //   requestAnimationFrame(this.progressStep);
    // } else {
    //   this.frameRequested = false;
    // }
  }
}

export default Player;
