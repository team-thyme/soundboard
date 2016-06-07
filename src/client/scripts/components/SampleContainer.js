import $ from 'jquery';
import Sample from './Sample';

class SampleContainer {

  /** @type jQuery */
  $sampleContainer;

  /** @type Sample[] */
  samples = [];

  /** @type string */
  sortType = 'recent';

  /** @type string */
  query = '';

  constructor() {
    this.$sampleContainer = $('.sample-container');
    this.$empty = $('.sample-container__empty');

    // Add events
    this.$sampleContainer
      .on('click', '.sample', function (e, params) {
        $(this).data('sample').handleClick(e, params);
      })
      .on('contextmenu', '.sample', function (e) {
        $(this).data('sample').handleContextMenu(e);
      })
      .on('mouseenter touchstart', '.sample', function (e) {
        $(this).data('sample').handleMouseEnter(e);
      })
      .on('mouseleave touchend', '.sample', function (e) {
        $(this).data('sample').handleMouseLeave(e);
      })
      .on('mousedown', '.sample', function (e) {
        $(this).data('sample').handleMouseDown(e);
      });
  }

  setSamples(samples) {
    // Sort samples
    const sortLimit = new Date().getTime() - 14 * 24 * 60 * 60 * 1000;

    samples.sort((sample1, sample2) => {
      if (sample1.mtime > sortLimit || sample2.mtime > sortLimit) {
        return sample2.mtime - sample1.mtime;
      }

      return 2 * Math.floor(2 * Math.random()) - 1;
    });

    // Create Sample objects
    this.samples = samples.map((data) => new Sample(data));

    // Add the samples to the DOM
    const $prev = this.$sampleContainer.prev();
    this.$sampleContainer.detach();

    this.samples.forEach((sample) => {
      this.$sampleContainer.append(sample.$sample);
    });

    this.$sampleContainer.insertAfter($prev);

    this.update();
  }

  update() {
    const $prev = this.$sampleContainer.prev();
    this.$sampleContainer.detach();

    let empty = true;

    if (this.query.trim() === '') {
      empty = false;

      this.samples.forEach((sample) => {
        sample.$sample.removeClass('sample--filtered');
      });
    } else {
      // Prepare regex
      const terms = this.query.split(' ');
      const regex = new RegExp(`.*${
        terms.map(term => `(?=.*${term}.*)`).join('')
      }.*`, 'i');

      // Filter samples
      this.samples.forEach((sample) => {
        const visible = regex.test(`${sample.name};${sample.categories.join(';')}`);
        sample.$sample.toggleClass('sample--filtered', !visible);
        if (visible) empty = false;
      });
    }

    this.$sampleContainer.toggleClass('sample-container--empty', empty);

    this.$sampleContainer.insertAfter($prev);
  }

  setQuery(query) {
    this.query = query;
  }

  playRandom({ shiftKey = false, ctrlKey = false }) {
    const $visibleSamples = $('.sample:not(.sample--filtered)');
    const index = Math.floor(Math.random() * $visibleSamples.length);
    $visibleSamples.eq(index).trigger('click', { shiftKey, ctrlKey });
  }

  playRandomWithId(id) {
    const $filteredSamples = $('.sample').filter(function () {
      return $(this).data('sample').id === id;
    });
    const index = Math.floor(Math.random() * $filteredSamples.length);
    const $sample = $filteredSamples.eq(index);
    $sample.trigger('click', { addToHistory: false });
    return $sample;
  }

}

export default SampleContainer;
