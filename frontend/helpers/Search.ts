import { type Sample } from '../api';

// Only word- and whitespace-chars are allowed in the indices and query
const ALLOWED_CHARS_REGEX = /[^\w\s]/g;

export class Search {
    private readonly samples: Sample[];
    private readonly normalizedSamples: string[];

    constructor(samples: Sample[]) {
        this.samples = samples;

        // Prepare the normalized sample index. The samples don't generally
        // change, so most of the time we only have to do this once.
        //
        // Example:
        // { name: 'tof', categories: ['voice', 'skik'] } => 'tof voice skik'
        this.normalizedSamples = samples.map((sample) => {
            let string = sample.name.replace(ALLOWED_CHARS_REGEX, '');
            sample.categories.forEach((category) => {
                string += ' ' + category.replace(ALLOWED_CHARS_REGEX, '');
            });
            return string.toLowerCase();
        });
    }

    public filter(query: string): Sample[] {
        // Normalize the query to match against the normalized samples
        const normalizedQuery = query
            .replace(ALLOWED_CHARS_REGEX, '')
            .toLowerCase()
            .trim();

        // Early return for empty queries
        if (normalizedQuery === '') {
            return this.samples;
        }

        // Split the query into an array of terms
        const terms = normalizedQuery.split(/[\s+&]+/g);

        return this.samples.filter((_sample, index) => {
            // Every term must be included in the sample text
            return terms.every((term) =>
                this.normalizedSamples[index].includes(term),
            );
        });
    }
}
