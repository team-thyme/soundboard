import { usePreference } from '../../helpers/preferences';

export function VolumeSlider() {
    // Volume is a number in the range 0-100
    const [volume, setVolume] = usePreference('volume');

    return (
        <input
            id="preference-volume"
            type="range"
            min={0}
            max={100}
            value={volume}
            onInput={(event) =>
                setVolume((event.target as HTMLInputElement).valueAsNumber)
            }
        />
    );
}
