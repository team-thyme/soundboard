import {
    createContext,
    type JSX,
    type ReactNode,
    type RefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import { type Sample } from '../api';
import { player } from '../helpers/Player';
import { type Search } from '../helpers/Search';
import { type SampleListImperativeHandle } from './SampleList/SampleList';

interface PlayerContextValue {
    playRandomSampleById(id: string): void;
    playRandomFilteredSample(): void;
}

export const PlayerContext = createContext<PlayerContextValue | null>(null);

interface PlayerContextProviderProps {
    children: ReactNode;
    samples: Sample[];
    filteredSamples: Sample[];
    sampleListRef: RefObject<SampleListImperativeHandle>;
    search: Search;
}

export function PlayerContextProvider(
    props: PlayerContextProviderProps,
): JSX.Element {
    const { sampleListRef, samples, filteredSamples, search } = props;

    /**
     * Play a random sample from the given list of samples. Returns `true` if a
     * sample was played.
     */
    const playRandomSample = useCallback((samples: Sample[]): boolean => {
        if (samples.length === 0) {
            return false;
        }

        const index = Math.floor(Math.random() * samples.length);
        const sample = samples[index];
        void player.togglePlay(sample, { spam: true });
        sampleListRef.current?.scrollToSample(sample);

        return true;
    }, []);

    /** Play a random sample from the filtered samples. */
    const playRandomFilteredSample = useCallback(
        () => playRandomSample(filteredSamples),
        [playRandomSample, filteredSamples],
    );

    /** Play a random sample by its ID (note that ID is not unique). */
    const playRandomSampleById = useCallback(
        (id: string) =>
            playRandomSample(samples.filter((sample) => sample.id === id)),
        [samples, playRandomSample],
    );

    /** Play a random sample matching the query. */
    const playRandomSampleByQuery = useCallback(
        (query: string) => playRandomSample(search.filter(query)),
        [search, playRandomSample],
    );

    const playedFromURI = useRef(false);
    useEffect(() => {
        if (playedFromURI.current || samples.length === 0) {
            return;
        }

        // Don't play from URI again
        playedFromURI.current = true;

        // Get path relative to base URI
        const path = window.location.href.substring(document.baseURI.length);
        const pathParts = path
            .split('/')
            .map((part) => part.trim())
            .filter((part) => part !== '');

        pathParts.forEach((part) => {
            // If part is an ID, play sample by ID. Otherwise, try to search for
            // a sample with the part as a query.
            playRandomSampleById(part) || playRandomSampleByQuery(part);
        });
    }, [samples, playRandomSampleById, playRandomSampleByQuery]);

    const playerContextValue = useMemo(
        () => ({
            playRandomSampleById,
            playRandomFilteredSample,
        }),
        [playRandomSampleById, playRandomFilteredSample],
    );

    return (
        <PlayerContext.Provider value={playerContextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
}
