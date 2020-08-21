import { useState, useCallback, useEffect } from 'react';
import * as React from 'react';
import cx from 'classnames';
import { Sample } from '../api';
import { player } from '../helpers/Player';

export interface SampleItemProps {
    sample: Sample;
}

function usePlayer(sample: Sample): { play(): void; isPlaying: boolean } {
    const [isPlaying, setPlaying] = useState(() =>
        player.isPlaying(sample.key),
    );

    useEffect(() => {
        function handlePlay() {
            setPlaying(true);
        }
        function handleEnded() {
            setPlaying(false);
        }

        const { key } = sample;
        player.on('play', key, handlePlay);
        player.on('ended', key, handleEnded);

        return () => {
            player.off('play', key, handlePlay);
            player.off('ended', key, handleEnded);
        };
    }, [sample]);

    const play = useCallback(() => {
        player.stopAll();
        player.play(sample);
    }, [sample]);

    return { play, isPlaying };
}

export default function SampleItem({ sample }: SampleItemProps) {
    const { play, isPlaying } = usePlayer(sample);

    return (
        <div
            className={cx('SampleItem', {
                'SampleItem--isPlaying': isPlaying,
            })}
            tabIndex={0}
            role="button"
            onClick={play}
        >
            <span className="SampleItem__name">{sample.name}</span>
            <span className="SampleItem__detail">
                {sample.categories.join(' / ')}
            </span>
        </div>
    );
}
