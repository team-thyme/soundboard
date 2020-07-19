import $ from 'jquery';
import 'jquery-contextmenu';
import copy from 'copy-to-clipboard';

export default class SampleContainer {
    /** @type jQuery */
    $sampleContainer;

    /** @type Sample[] */
    samples = [];

    /** @type string */
    query = '';

    constructor() {
        this.$sampleContainer = $('.sample-container');

        // Play/stop on click
        this.$sampleContainer.on('click', '.sample', (e) => {
            const sample = $(e.currentTarget).data('sample');

            const spam = e.shiftKey;

            if (!sample.isPlaying() || spam) {
                sample.play(spam, e.ctrlKey);
            } else {
                sample.stop();
            }
        });
    }

    setSamples(samples) {
        // Sort samples
        const sortLimit = new Date().getTime() - (14 * 24 * 60 * 60 * 1000);

        this.samples = samples.sort((sample1, sample2) => {
            if (sample1.mtime > sortLimit || sample2.mtime > sortLimit) {
                return sample2.mtime - sample1.mtime;
            }

            return (2 * Math.floor(2 * Math.random())) - 1;
        });

        // Add the samples to the DOM
        const $prev = this.$sampleContainer.prev();
        this.$sampleContainer.detach();

        this.samples.forEach((sample) => {
            this.$sampleContainer.append(sample.$sample);
        });

        this.$sampleContainer.insertAfter($prev);

        // Add a context menu for the samples
        $.contextMenu({
            selector: '.sample',
            items: {
                loop: {
                    name: 'Loop (Ctrl + Click)',
                    callback: (key, opt) => {
                        opt.$trigger.data('sample').play(false, true);
                    },
                },
                spam: {
                    name: 'Spam (Shift + Click)',
                    callback: (key, opt) => {
                        opt.$trigger.data('sample').play(true, false);
                    },
                },
                copy: {
                    name: 'Copy url',
                    callback: (key, opt) => {
                        // Get url to sample by letting the browser resolve it relatively
                        // (takes into account the base url set)
                        const anchor = document.createElement('a');
                        anchor.href = opt.$trigger.data('sample').id;
                        copy(anchor.href);
                    },
                },
                bind: {
                    name: 'Bind to key',
                    callback: () => {
                        throw new Error('Not implemented');
                    },
                    disabled: true,
                },
            },
        });

        this.update();
    }

    update(query) {
        if (typeof query === 'string') {
            this.query = query;
        }

        const $prev = this.$sampleContainer.prev();

        // Updating the container in detached state is quicker
        this.$sampleContainer.detach();

        let empty = true;

        if (this.query.trim() === '') {
            empty = false;

            this.samples.forEach((sample) => {
                sample.$sample.removeClass('sample--filtered');
            });
        } else {
            // Prepare regex
            const terms = this.query
                // Strip non-alphanumeric characters (will be done in target as well)
                .replace(/[^\w\s|]/g, '')
                // Enable OR-searching when whitespace is around the pipe character "|"
                .replace(/\s+\|\s+/g, '|')
                // Split by any combination of whitespace characters
                .split(/[\s+&]+/g);
            const regex = new RegExp(`.*${terms.map(term => `(?=.*${term}.*)`).join('')}.*`, 'i');

            // Filter samples
            this.samples.forEach((sample) => {
                let filterString = sample.name.replace(/[^\w\s|]/g, '');
                sample.categories.forEach((category) => {
                    filterString += ' ' + category.replace(/[^\w\s|]/g, '');
                });

                const isVisible = regex.test(filterString);
                sample.$sample.toggleClass('sample--filtered', !isVisible);

                if (isVisible) {
                    empty = false;
                }
            });
        }

        this.$sampleContainer.toggleClass('sample-container--empty', empty);

        if (!empty) {
            this.updateLines();
        }

        this.$sampleContainer.insertAfter($prev);
    }

    /**
     * Updates line classes on visible samples so they can be made awesome by
     * themes.
     */
    updateLines() {
        let row = -1;
        let lastTop = 0;

        this.$sampleContainer.find('.sample:not(.sample--filtered)').each(function() {
            const { top } = $(this).offset();
            if (lastTop < top) {
                row += 1;
            }
            lastTop = top;

            $(this)
                .toggleClass('sample--line-0', row % 3 === 0)
                .toggleClass('sample--line-1', row % 3 === 1)
                .toggleClass('sample--line-2', row % 3 === 2);
        });
    }

    /**
     * Returns the sample object that has been played, or null.
     *
     * @param {string} id
     * @param {boolean} [spam]
     * @param {boolean} [loop]
     * @param {boolean} [scroll]
     * @returns {Promise<boolean>}
     */
    async playRandomWithId(id, spam = false, loop = false, scroll = false) {
        // Obtain a sample
        const $filteredSamples = $('.sample').filter(function() {
            return $(this).data('sample').id === id;
        });

        if ($filteredSamples.length === 0) {
            return false;
        }

        const index = Math.floor(Math.random() * $filteredSamples.length);
        const $sample = $filteredSamples.eq(index);

        return this.playSample($sample, spam, loop, scroll);
    }

    async playRandomVisible(spam = false, loop = false, scroll = false) {
        const $visibleSamples = $('.sample:not(.sample--filtered)');

        if ($visibleSamples.length === 0) {
            return false;
        }

        const index = Math.floor(Math.random() * $visibleSamples.length);
        const $sample = $visibleSamples.eq(index);

        return this.playSample($sample, spam, loop, scroll);
    }

    async playSample($sample, spam, loop, scroll) {
        if (scroll) {
            $('html, body').animate({
                scrollTop: ($sample.offset().top - 100),
            });
        }

        return $sample.data('sample').play(spam, loop);
    }
}
