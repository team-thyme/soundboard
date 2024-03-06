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

    const playRandomFilteredSample = useCallback(() => {
        if (filteredSamples.length === 0) {
            return;
        }

        const index = Math.floor(Math.random() * filteredSamples.length);
        const sample = filteredSamples[index];
        void player.togglePlay(sample);
        sampleListRef.current?.scrollToSample(sample);
    }, [filteredSamples]);

    const playSampleById = useCallback(
        (id: string) => {
            const sample = samples.find((sample) => sample.id === id);
            if (!sample) {
                return;
            }
            void player.togglePlay(sample);
            sampleListRef.current?.scrollToSample(sample);
        },
        [samples],
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
