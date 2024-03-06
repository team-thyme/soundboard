import { JSX } from 'react';

import ThemeSelect from './ThemeSelect';
import { VersionInfo } from './VersionInfo';
import { VolumeSlider } from './VolumeSlider';

export function Preferences(): JSX.Element {
    return (
        <div className="Preferences">
            <div className="Preferences__section">
                <label
                    className="Preferences__label"
                    htmlFor="preference-volume"
                >
                    Volume
                </label>
                <VolumeSlider />
            </div>
            <div className="Preferences__section">
                <label
                    className="Preferences__label"
                    htmlFor="preference-theme"
                >
                    Theme
                </label>
                <ThemeSelect />
            </div>
            <div className="Preferences__section">
                <VersionInfo />
            </div>
        </div>
    );
}
