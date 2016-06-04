import $ from 'jquery';
import Sample from './Sample';

const sortFunctions = {

  /**
   * Sort samples by date.
   * @param {Sample[]} samples
   */
  recent: (samples) => {
    const sortLimit = new Date().getTime() - 14 * 24 * 60 * 60 * 1000;

    samples.sort((sample1, sample2) => {
      if (sample1.mtime > sortLimit || sample2.mtime > sortLimit) {
        return sample2.mtime - sample1.mtime;
      }

      return 2 * Math.floor(2 * Math.random()) - 1;
    });
  },

  /**
   * Sort samples by name.
   * @param {Sample[]} samples
   */
  name: (samples) => {
    samples.sort((sample1, sample2) => sample1.name.localeCompare(sample2.name));
  },

};

class SampleContainer {

  $sampleContainer = $('.sample-container');

  /** @type Sample[] */
  samples = [];

  sortType = 'recent';

  setSamples(samples) {
    // Create Sample objects
    this.samples = samples.map((data) => new Sample(data));

    // Add the samples to the DOM
    this.sortSamples();
  }

  sortSamples() {
    if (typeof sortFunctions[this.sortType] === 'function') {
      // Sort the samples
      sortFunctions[this.sortType](this.samples);

      // Detach and re-attach samples in the correct order
      this.$sampleContainer.detach('.sample');
      this.samples.forEach((sample) => this.$sampleContainer.append(sample.$sample));
    } else {
      throw new Error(`Unknown sort type "${this.sortType}"`);
    }
  }

}

export default SampleContainer;
