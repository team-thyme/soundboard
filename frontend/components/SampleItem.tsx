import { useState, useCallback } from 'react';
import * as React from 'react';
import cx from 'classnames';
import { Sample } from '../api';
import { player } from '../helpers/Player';

export interface SampleItemProps {
    sample: Sample;
}

function usePlayer(sample: Sample): { play(): void; isPlaying: boolean } {
    // TODO: Get `isPlaying` state from Player instance when component is mounted
    const [isPlaying, setPlaying] = useState(false);

    const play = useCallback(() => {
        setPlaying(true);
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
