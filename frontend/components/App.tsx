import React, {
    Context,
    createContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { fetchSamples, Sample } from '../api';
import { sortSamples } from '../helpers/sortSamples';
import BlockedOverlay from './BlockedOverlay';

import Header from './Header';
import SampleList from './SampleList/SampleList';

type SearchContextValue = {
    query: string;
    setQuery(query: string): void;
};

export const SearchContext: Context<SearchContextValue> = React.createContext(
    // This will cause errors if no SearchContext.Provider is used, but that
    // should never happen. And I would prefer a hard error over it silently not
    // working any day.
    undefined as any,
);

function useSearchContextValue(): SearchContextValue {
    const [query, setQuery] = useState('');
    return useMemo(() => ({ query, setQuery }), [query, setQuery]);
}

export enum Theme {
    Default = 'default',
    Cirkeltrek = 'cirkeltrek',
    DefaultClassic = 'default-classic',
}

type ThemeContextValue = {
    theme: Theme;
    setTheme(theme: Theme): void;
};

export const ThemeContext: Context<ThemeContextValue> = React.createContext(
    undefined as any,
);

function useThemeContextValue(): ThemeContextValue {
    const [theme, setTheme] = useState(Theme.Default);

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    return useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
}

interface SamplesContextValue {
    samples: Sample[];
}

export const SamplesContext = createContext<SamplesContextValue>({
    samples: [],
});

function useSamplesContextValue(): SamplesContextValue {
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

    return useMemo(() => ({ samples }), [samples]);
}

export default function App() {
    const searchContext = useSearchContextValue();
    const themeContext = useThemeContextValue();
    const samplesContext = useSamplesContextValue();

    return (
        <SearchContext.Provider value={searchContext}>
            <ThemeContext.Provider value={themeContext}>
                <SamplesContext.Provider value={samplesContext}>
                    <BlockedOverlay />
                    <Header />
                    <SampleList />
                </SamplesContext.Provider>
            </ThemeContext.Provider>
        </SearchContext.Provider>
    );
}
