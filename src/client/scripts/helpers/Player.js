import SettingsManager from './SettingsManager';

class Player {
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

  static init() {
    this.instance = new Player();
  }

  constructor() {
    this.progressStep = this.progressStep.bind(this);

    // Set up volume control using a gain node
    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination)

    // Initial volume
    gainNode.gain.value = SettingsManager.instance.get('volume');

    // Bind to volume changes
    SettingsManager.instance.on('volume', (volume) => {
      gainNode.gain.value = volume;
    });

    // Set the gain node as the destination node
    this.audioDestinationNode = gainNode;
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
      source.connect(player.audioDestinationNode);

      audio.loop = loop;

      audio.play();

      // Add to playing
      player.playing[sampleIndex].push(audio);

      // Register audio stop and pause events
      audio.onended = audio.onpause = function() {
        // BUG: Removes two every stop, so messes with simultaneous plays. This is because of Array.prototype.indexOf matching by value instead of reference

        // Remove from playing
        const spliced = player.playing[sampleIndex].splice(player.playing[sampleIndex].indexOf(audio), 1);

        // Trigger onStop only when we just removed the last playing intance of this sample
        if (spliced.length > 0 && player.playing[sampleIndex].length == 0) {
          sample.onStop();
        }
      };

      // Trigger onPlay only when this is the first instance of this sample to start playing
      if (player.playing[sampleIndex].length == 1) {
        sample.onPlay();

        // Request animation frame (only once)
        if (!player.frameRequested) {
          player.frameRequested = true;

          requestAnimationFrame(player.progressStep);
        }
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
        // Use the last playing sample to reflect the most recently started sample
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
