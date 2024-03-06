import { useEffect, useMemo, useRef, useState } from 'react';

import { fetchSamples, type Sample } from '../api';
import { player } from '../helpers/Player';
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

function usePlaySamplesFromURI(
    allSamples: Sample[],
    scrollToSample: (sample: Sample) => void,
): void {
    const playedFromURI = useRef(false);
    useEffect(() => {
        if (playedFromURI.current || allSamples.length === 0) {
            return;
        }

        // Get path relative to base URI
        const path = window.location.href.substring(document.baseURI.length);
        const pathParts = path
            .split('/')
            .map((part) => part.trim())
            .filter((part) => part !== '');

        // Select samples to play
        const selectedSamples: Sample[] = [];
        pathParts.forEach((part) => {
            const matchingSamples = allSamples.filter(
                (sample) =>
                    sample.id === part && !selectedSamples.includes(sample),
            );
            if (matchingSamples.length === 0) {
                return;
            }
            const index = Math.floor(Math.random() * matchingSamples.length);
            selectedSamples.push(matchingSamples[index]);
        });

        // Don't play from URI again
        playedFromURI.current = true;

        if (selectedSamples.length === 0) {
            return;
        }

        // Play the selected samples
        selectedSamples.forEach((sample) => {
            void player.togglePlay(sample);
        });

        // Scroll to the first selected sample
        scrollToSample(selectedSamples[0]);
    }, [allSamples]);
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

    usePlaySamplesFromURI(samples, (sample) => {
        sampleListRef.current?.scrollToSample(sample);
    });

    return (
        <PlayerContextProvider
            samples={samples}
            filteredSamples={filteredSamples}
            sampleListRef={sampleListRef}
        >
            <BlockedOverlay />
            <Header query={query} onQueryChange={setQuery} />
            <SampleList ref={sampleListRef} samples={filteredSamples} />
        </PlayerContextProvider>
    );
}
