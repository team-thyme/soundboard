import $ from 'jquery';
import fastBind from 'fast-bind';
import Player from '../helpers/Player';
import { $div } from '../helpers/jquery-utils';

class Sample {

  /** @type string */
  id;

  /** @type string */
  url;

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

  constructor(data) {
    this.id = data.id;
    this.url = data.url;
    this.name = data.name;
    this.categories = data.categories;
    this.mtime = data.mtime;

    this.playerId = Player.instance.registerSample(
      this.url,
      fastBind.call(this.handlePlay, this),
      fastBind.call(this.handleStop, this),
      fastBind.call(this.handleProgress, this)
    );

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

  play(spam = false, loop = false) {
    Player.instance.play(this.playerId, spam, loop);
  }

  stop() {
    Player.instance.stop(this.playerId);
  }

  isPlaying() {
    return Player.instance.isPlaying(this.playerId);
  }
}

export default Sample;
