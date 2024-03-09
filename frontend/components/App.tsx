import { useEffect, useMemo, useRef, useState } from 'react';

import { fetchSamples, type Sample } from '../api';
import { usePreference } from '../helpers/preferences';
import { Search } from '../helpers/Search';
import { sortSamples } from '../helpers/sortSamples';
import { BlockedOverlay } from './BlockedOverlay';

import { Header } from './Header';
import { PlayerContextProvider } from './PlayerContext';
import {
    SampleList,
    type SampleListImperativeHandle,
} from './SampleList/SampleList';

function useSamples(): Sample[] {
    const [samples, setSamples] = useState<Sample[]>([]);

    useEffect(() => {
        async function handleFetchSamples(signal: AbortSignal) {
            try {
                const samples = await fetchSamples(signal);
                sortSamples(samples);
                setSamples(samples);
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    // Fetch was aborted
                    return;
                }
                throw error;
            }
        }

        const controller = new AbortController();
        void handleFetchSamples(controller.signal);
        return () => controller.abort();
    }, []);

    return samples;
}

export default function App() {
    const [theme] = usePreference('theme');
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    const [query, setQuery] = useState('');
    const samples = useSamples();

    const sampleListRef = useRef<SampleListImperativeHandle>(null);

    const search = useMemo(() => new Search(samples), [samples]);
    const filteredSamples = useMemo(
        () => search.filter(query),
        [search, query],
    );

    return (
        <PlayerContextProvider
            samples={samples}
            filteredSamples={filteredSamples}
            sampleListRef={sampleListRef}
            search={search}
        >
            <BlockedOverlay />
            <Header query={query} onQueryChange={setQuery} />
            <SampleList ref={sampleListRef} samples={filteredSamples} />
        </PlayerContextProvider>
    );
}
