import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { fetchSamples, Sample } from '../api';
import Header from './Header';
import SampleList from './SampleList';

function useSamples(): Sample[] {
    const [samples, setSamples] = useState([]);

    useEffect(() => {
        fetchSamples().then((samples) => {
            // Sort samples
            const sortLimit = new Date().getTime() - 14 * 24 * 60 * 60 * 1000;
            samples = samples.sort((sample1, sample2) => {
                if (sample1.mtime > sortLimit || sample2.mtime > sortLimit) {
                    return sample2.mtime - sample1.mtime;
                }

                return 2 * Math.floor(2 * Math.random()) - 1;
            });

            setSamples(samples);
        });
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

export const SearchContext = React.createContext({
    query: '',
    setQuery: (_query: string) => {},
});

export default function App() {
    const [query, setQuery] = useState('');
    const samples = useFilteredSamples(query);

    const searchContext = useMemo(() => ({ query, setQuery }), [
        query,
        setQuery,
    ]);

    return (
        <SearchContext.Provider value={searchContext}>
            <Header />
            <SampleList samples={samples} />
        </SearchContext.Provider>
    );
}
