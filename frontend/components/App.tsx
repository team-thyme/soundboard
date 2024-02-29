import React, {
    Context,
    createContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { fetchSamples, Sample } from '../api';
import { player } from '../helpers/Player';
import { Search } from '../helpers/Search';
import { sortSamples } from '../helpers/sortSamples';
import BlockedOverlay from './BlockedOverlay';

import Header from './Header';
import {
    SampleList,
    SampleListImperativeHandle,
} from './SampleList/SampleList';

export enum Theme {
    Default = 'default',
    Cirkeltrek = 'cirkeltrek',
    DefaultClassic = 'default-classic',
}

type ThemeContextValue = {
    theme: Theme;
    setTheme(theme: Theme): void;
};

export const ThemeContext: Context<ThemeContextValue> = createContext(
    undefined as any,
);

function useThemeContextValue(): ThemeContextValue {
    const [theme, setTheme] = useState(Theme.Default);

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    return useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
}

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
    const themeContext = useThemeContextValue();

    const [query, setQuery] = useState('');
    const samples = useSamples();

    const sampleListRef = React.createRef<SampleListImperativeHandle>();

    const search = useMemo(() => new Search(samples), [samples]);
    const filteredSamples = useMemo(
        () => search.filter(query),
        [search, query],
    );

    usePlaySamplesFromURI(samples, (sample) => {
        sampleListRef.current?.scrollToSample(sample);
    });

    return (
        <ThemeContext.Provider value={themeContext}>
            <BlockedOverlay />
            <Header query={query} onQueryChange={setQuery} />
            <SampleList ref={sampleListRef} samples={filteredSamples} />
        </ThemeContext.Provider>
    );
}
