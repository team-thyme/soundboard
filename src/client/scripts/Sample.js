import $ from 'jquery';
import { Howl } from 'howler';

const playing = [];

export default class Sample {

  constructor({ id, file, name, location }) {
    this.id = id;
    this.file = file;
    this.name = name;
    this.location = location;

    this.boundProgressStep = this.progressStep.bind(this);

    this.initSound();

    this.createElements();
    this.bindEvents();
  }

  progressStep() {
    const { howl, $progress } = this;

    const seek = howl.seek() || 0;
    const progress = (seek / howl.duration()) * 100;
    $progress.css('flex-basis', `${progress}%`);

    if (howl.playing()) {
      requestAnimationFrame(this.boundProgressStep);
    }
  }

  initSound() {
    const howl = this.howl = new Howl({
      src: [encodeURI(`samples/${this.file}`)],
      //html5: true, // Use HTML5 Audio, so large files can be streamed
      preload: false,
    });

    howl.on('play', () => {
      playing.push(howl);
      this.$sample.addClass('sample--playing');
      requestAnimationFrame(this.boundProgressStep);
    });

    howl.on('stop', () => {
      playing.splice(playing.indexOf(howl));
      this.$sample.removeClass('sample--playing');
    });
  }

  createElements() {
    const $sample = this.$sample = $('<div />')
      .addClass('sample');

    $sample.append($('<div />')
      .addClass('sample__name')
      .text(this.name)
    );

    $sample.append($('<div />')
      .addClass('sample__location')
      .text(this.location)
    );

    const $progress = this.$progress = $('<div />')
      .addClass('sample__progress');

    $sample.append($('<div />')
      .addClass('sample__progress-container')
      .append($progress)
    );
  }

  bindEvents() {
    const { $sample } = this;

    // Preload sound when the user hovers over the sample for more than 150ms
    let hoverTimer;

    $sample.on('mouseenter', () => {
      if (this.howl.state() === 'unloaded') {
        hoverTimer = setTimeout(() => {
          this.howl.load();
        }, 150);
      }
    });

    $sample.on('mouseleave', () => {
      clearTimeout(hoverTimer);
    });

    // Preload the sound when the user presses down on the sample
    $sample.on('mousedown touchstart', () => {
      if (this.howl.state() === 'unloaded') {
        this.howl.load();
      }
    });

    // Play the sound on click
    $sample.on('click', (e) => {
      // Stop all other playing sounds unless the shift key was pressed
      if (!e.shiftKey) {
        playing.forEach((howl) => howl.stop());
        playing.length = 0;
      }

      this.howl.play();
    });
  }

}
