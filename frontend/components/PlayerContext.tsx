import {
    createContext,
    JSX,
    ReactNode,
    RefObject,
    useCallback,
    useMemo,
} from 'react';
import { Sample } from '../api';
import { player } from '../helpers/Player';
import { SampleListImperativeHandle } from './SampleList/SampleList';

interface PlayerContextValue {
    playSampleById(id: string): void;
    playRandomFilteredSample(): void;
}

export const PlayerContext = createContext<PlayerContextValue | null>(null);

interface PlayerContextProviderProps {
    children: ReactNode;
    samples: Sample[];
    filteredSamples: Sample[];
    sampleListRef: RefObject<SampleListImperativeHandle>;
}

export function PlayerContextProvider(
    props: PlayerContextProviderProps,
): JSX.Element {
    const { sampleListRef, samples, filteredSamples } = props;

    const playRandomSample = useCallback((samples: Sample[]) => {
        if (samples.length === 0) {
            return;
        }

        const index = Math.floor(Math.random() * samples.length);
        const sample = samples[index];
        void player.togglePlay(sample, { spam: true });
        sampleListRef.current?.scrollToSample(sample);
    }, []);

    const playRandomFilteredSample = useCallback(() => {
        playRandomSample(filteredSamples);
    }, [playRandomSample, filteredSamples]);

    const playSampleById = useCallback(
        (id: string) => {
            playRandomSample(samples.filter((sample) => sample.id === id));
        },
        [playRandomSample, samples],
    );

    const playerContextValue = useMemo(
        () => ({
            playSampleById,
            playRandomFilteredSample,
        }),
        [playSampleById, playRandomFilteredSample],
    );

    return (
        <PlayerContext.Provider value={playerContextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
}
