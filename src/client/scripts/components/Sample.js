import $ from 'jquery';
import fastBind from 'fast-bind';
import Player from '../helpers/Player';
import { $div } from '../helpers/jquery-utils';

class Sample {

  /** @type string */
  id;

  /** @type string */
  file;

  /** @type string */
  name;

  /** @type string[] */
  categories;

  /** @type number */
  mtime;

  /** @type jQuery */
  $sample;

  /** @type jQuery */
  $progress;

  /** @type number */
  hoverTimer;

  constructor(data) {
    this.id = data.id;
    this.file = data.file;
    this.name = data.name;
    this.categories = data.categories;
    this.mtime = data.mtime;

    this.playerId = Player.instance.registerSample({
      file: this.file,
      onPlay: fastBind.call(this.handlePlay, this),
      onStop: fastBind.call(this.handleStop, this),
      onProgress: fastBind.call(this.handleProgress, this),
    });

    this.createElements();
  }

  handlePlay() {
    this.$sample.addClass('sample--playing');
  }

  handleStop() {
    this.$sample.removeClass('sample--playing');
  }

  handleProgress(progress) {
    this.$progress.css('transform', `scale(${progress / 100}, 1)`);
  }

  createElements() {
    const $sample = this.$sample = $div()
      .addClass('sample')
      .data('sample', this);

    $sample.append($div()
      .addClass('sample__name')
      .text(this.name)
    );

    $sample.append($div()
      .addClass('sample__categories')
      .toggleClass('sample__categories--empty', this.categories.length === 0)
      .text(this.categories.join(' / '))
    );

    const $progress = this.$progress = $div()
      .addClass('sample__progress');

    $sample.append($div()
      .addClass('sample__progress-container')
      .append($progress)
    );
  }

  handleClick(e, params = { shiftKey: false, ctrlKey: false, addToHistory: true }) {
    const multiple = e.shiftKey || params.shiftKey;
    const loop = e.ctrlKey || params.ctrlKey;

    Player.instance.play(this.playerId, multiple, loop);

    if (params.addToHistory && (history.state === null || history.state.id !== this.id)) {
      history.pushState({ id: this.id }, '', this.id);
    }
  }

  handleContextMenu(e) {
    e.preventDefault();
    Player.instance.stop(this.playerId);
  }

  handleMouseEnter() {
    if (Player.instance.isUnloaded(this.playerId)) {
      this.hoverTimer = setTimeout(() => {
        Player.instance.load(this.playerId);
      }, 150);
    }
  }

  handleMouseLeave() {
    clearTimeout(this.hoverTimer);
  }

  handleMouseDown() {
    Player.instance.load(this.playerId);
  }
}

export default Sample;
