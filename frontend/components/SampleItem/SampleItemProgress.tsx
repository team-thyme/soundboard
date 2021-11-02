import React, { useEffect, useState } from 'react';

import { Sample } from '../../api';
import { player } from '../../helpers/Player';

function usePlayerProgress(sample: Sample): number[] {
    const [progresses, setProgresses] = useState<number[]>(() =>
        player.getProgresses(sample.key),
    );

    useEffect(() => {
        function handleProgress() {
            setProgresses(player.getProgresses(key));
        }

        const { key } = sample;
        player.on('progress', key, handleProgress);

        return () => {
            player.off('progress', key, handleProgress);
        };
    }, [sample]);

    return progresses;
}

export default function SampleItemProgress(props: {
    sample: Sample;
}): JSX.Element {
    const { sample } = props;
    const progresses = usePlayerProgress(sample);

    return (
        <>
            {progresses.map((progress, index) => (
                <div
                    key={index}
                    className="SampleItem__progress"
                    style={{ transform: `scaleX(${progress})` }}
                />
            ))}
        </>
    );
}
