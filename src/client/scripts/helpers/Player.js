import SettingsManager from './SettingsManager';

class Player {
  static instance;

  // The registered samples
  samples = [];

  // An array of audio nodes that are currently playing per sample
  playing = [];

  // Used to create audio sources and as destination for the playing samples
  audioContext = new AudioContext();

  // Whether an animation frame is requested, indicating that no new loop has to be spawned
  frameRequested = false;

  static init() {
    this.instance = new Player();
    this.instance.context = new AudioContext();

    // TODO: Gain node
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

      // Register audio stop and pause events
      audio.onended = audio.onpause = function() {
        // Remove from playing
        const spliced = player.playing[sampleIndex].splice(player.playing[sampleIndex].indexOf(audio), 1);

        // Might be called multiple times, so only trigger onStop when actually removed from playing
        if (spliced.length > 0) {
          sample.onStop();
        }
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
    let samplesArePlaying = false;
    this.playing.forEach((playing, sampleIndex) => {
      if (playing.length > 0) {
        const progress = playing[playing.length - 1].currentTime / playing[playing.length - 1].duration * 100;
        this.samples[sampleIndex].onProgress(progress);

        samplesArePlaying = true;
      }
    });

    this.frameRequested = samplesArePlaying;

    // Keep requesting an animation frame until all no samples are playing
    if (this.frameRequested) {
      window.requestAnimationFrame(this.progressStep);
    }
  }
}

export default Player;
