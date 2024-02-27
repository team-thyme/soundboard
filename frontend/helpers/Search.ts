import { type Sample } from '../api';

// Only word- and whitespace-chars are allowed in the indices and query
const ALLOWED_CHARS_REGEX = /[^\w\s]/g;

function normalize(string: string): string {
    return string.replace(ALLOWED_CHARS_REGEX, '').toLowerCase().trim();
}

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
        this.normalizedSamples = samples.map((sample) =>
            [sample.name, ...sample.categories].map(normalize).join(' '),
        );
    }

    public filter(query: string): Sample[] {
        // Normalize the query to match against the normalized samples
        const normalizedQuery = normalize(query);

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
