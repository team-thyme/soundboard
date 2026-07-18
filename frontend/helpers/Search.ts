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
        const subQueryTerms = query
            // Split the query into sub-queries
            .split('|')
            // Normalize the query to match against the normalized samples
            .map(normalize)
            // Remove empty sub-queries
            .filter((subQuery) => subQuery !== '')
            // Split into an array of terms
            .map((subQuery) => subQuery.split(/[\s+&]+/g));

        // Early return for empty queries
        if (subQueryTerms.length === 0) {
            return this.samples;
        }

        return this.samples.filter((_sample, index) => {
            // The sample must match at least one of the sub-queries
            return subQueryTerms.some((terms) => {
                // Every term must be included in the sample text
                return terms.every((term) =>
                    this.normalizedSamples[index].includes(term),
                );
            });
        });
    }
}
