import $ from 'jquery';
import Player from './Player';

class Sample {

  constructor({ id, file, name, location }) {
    this.id = id;
    this.file = file;
    this.name = name;
    this.location = location;

    this.playerId = Player.registerSample({
      file,
      onPlay: () => {
        this.$sample.addClass('sample--playing');
      },
      onStop: () => {
        this.$sample.removeClass('sample--playing');
      },
      onProgress: (progress) => {
        this.$progress.css('flex-basis', `${progress}%`);
      },
    });

    this.createElements();
    this.bindEvents();
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
      if (Player.isUnloaded(this.playerId)) {
        hoverTimer = setTimeout(() => {
          Player.load(this.playerId);
        }, 150);
      }
    });

    $sample.on('mouseleave', () => {
      clearTimeout(hoverTimer);
    });

    // Preload the sound when the user presses down on the sample
    $sample.on('mousedown touchstart', () => {
      Player.load(this.playerId);
    });

    // Play the sound on click
    $sample.on('click', (e) => {
      const multiple = e.shiftKey;
      const loop = e.ctrlKey;

      Player.play(this.playerId, multiple, loop);
    });
  }

}

export default Sample;
