import { type JSX, useId } from 'react';

import { usePreference } from '../../helpers/preferences';

export function VolumeSection(): JSX.Element {
    // Volume is a number in the range 0-100
    const [volume, setVolume] = usePreference('volume');
    const id = useId();

    return (
        <div className="Preferences__section">
            <label className="Preferences__label" htmlFor={id}>
                Volume
            </label>
            <input
                id={id}
                type="range"
                min={0}
                max={100}
                value={volume}
                onInput={(event) =>
                    setVolume(event.currentTarget.valueAsNumber)
                }
            />
        </div>
    );
}
