import { type JSX } from 'react';

import { ThemeSection } from './ThemeSection';
import { VersionSection } from './VersionSection';
import { VolumeSection } from './VolumeSection';

export function Preferences(): JSX.Element {
    return (
        <div className="Preferences">
            <VolumeSection />
            <ThemeSection />
            <VersionSection />
        </div>
    );
}
