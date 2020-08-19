import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { fetchSamples, Sample } from '../api';
import SampleList from './SampleList';

function useSamples(): Sample[] {
    const [samples, setSamples] = useState([]);

    useEffect(() => {
        fetchSamples().then(setSamples);
    }, []);

    return samples;
}

function useFilteredSamples(query: string): Sample[] {
    const samples = useSamples();
    return useMemo(() => {
        if (query.trim() === '') {
            return samples;
        }

        // Prepare regex
        const terms = query
            // Strip non-alphanumeric characters (will be done in target as well)
            .replace(/[^\w\s|]/g, '')
            // Enable OR-searching when whitespace is around the pipe character "|"
            .replace(/\s+\|\s+/g, '|')
            // Split by any combination of whitespace characters
            .split(/[\s+&]+/g);
        const regex = new RegExp(
            `.*${terms.map((term) => `(?=.*${term}.*)`).join('')}.*`,
            'i',
        );

        return samples.filter((sample) => {
            let filterString = sample.name.replace(/[^\w\s|]/g, '');
            sample.categories.forEach((category) => {
                filterString += ' ' + category.replace(/[^\w\s|]/g, '');
            });

            return regex.test(filterString);
        });
    }, [samples, query]);
}

export default function App() {
    const [query, setQuery] = useState('');
    const samples = useFilteredSamples(query);

    return (
        <div>
            <input
                onChange={(event) => setQuery(event.target.value)}
                value={query}
            />
            <SampleList samples={samples} />
        </div>
    );
}
