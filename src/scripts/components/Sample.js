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
            fastBind.call(this.handleProgress, this),
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
        this.$progress.css('width', `${progress}%`);
    }

    createElements() {
        this.$sample = $div()
            .addClass('sample')
            .data('sample', this);

        this.$sample.append($div()
            .addClass('sample__name')
            .text(this.name));

        this.$sample.append($div()
            .addClass('sample__categories')
            .toggleClass('sample__categories--empty', this.categories.length === 0)
            .text(this.categories.join(' / ')));

        this.$progress = $div().addClass('sample__progress');
        this.$sample.append(this.$progress);
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
