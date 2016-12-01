import $ from 'jquery';

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
    });
  }

  setSamples(samples) {
    // Sort samples
    const sortLimit = new Date().getTime() - 14 * 24 * 60 * 60 * 1000;

    this.samples = samples.sort((sample1, sample2) => {
      if (sample1.mtime > sortLimit || sample2.mtime > sortLimit) {
        return sample2.mtime - sample1.mtime;
      }

      return 2 * Math.floor(2 * Math.random()) - 1;
    });

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
        const visible = regex.test(`${sample.name} ${sample.categories.join(' ')}`);
        sample.$sample.toggleClass('sample--filtered', !visible);
        if (visible) empty = false;
      });
    }

    this.$sampleContainer.toggleClass('sample-container--empty', empty);

    this.$sampleContainer.insertAfter($prev);

    if (!empty) {
      this.updateLines();
    }
  }

  updateLines() {
    let row = -1;
    let lastTop = 0;

    this.$sampleContainer.find('.sample:not(.sample--filtered)').each(function () {
      const { top } = $(this).offset();
      if (lastTop < top) row++;
      lastTop = top;

      $(this)
        .toggleClass('sample--line-0', row % 3 === 0)
        .toggleClass('sample--line-1', row % 3 === 1)
        .toggleClass('sample--line-2', row % 3 === 2);
    });

    const $prev = this.$sampleContainer.prev();
    this.$sampleContainer.detach();
    this.$sampleContainer.insertAfter($prev);
  }

  setQuery(query) {
    this.query = query;
  }

  playRandom({ shiftKey = false, ctrlKey = false, scroll = false, addToHistory = false }) {
    const $visibleSamples = $('.sample:not(.sample--filtered)');
    const index = Math.floor(Math.random() * $visibleSamples.length);
    const $sample = $visibleSamples.eq(index);
    $sample.trigger('click', { shiftKey, ctrlKey, addToHistory });

    if (scroll) {
      this.scrollToSample($sample);
    }

    return $sample;
  }

  playRandomWithId({ id, scroll = false, addToHistory = false }) {
    const $filteredSamples = $('.sample').filter(function () {
      return $(this).data('sample').id === id;
    });

    if ($filteredSamples.length === 0) {
      return null;
    }

    const index = Math.floor(Math.random() * $filteredSamples.length);
    const $sample = $filteredSamples.eq(index);
    $sample.trigger('click', { addToHistory });

    if (scroll) {
      this.scrollToSample($sample);
    }

    return $sample;
  }

  scrollToSample($sample) {
    const sampleTop = $sample.offset().top;

    $('html, body').animate({
      scrollTop: sampleTop - 100,
    });
  }
}

export default SampleContainer;
