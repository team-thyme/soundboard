import { type JSX, useContext } from 'react';

import { config } from '../../config';
import { PlayerContext } from '../PlayerContext';

export function VersionSection(): JSX.Element {
    return (
        <div className="Preferences__section">
            <VersionInfo />
        </div>
    );
}

function VersionInfo(): JSX.Element {
    const { playRandomSampleByHash } = useContext(PlayerContext)!;

    return (
        <div className="VersionInfo">
            <a
                href={`${config.repositoryUrl}/releases/tag/v${config.versionNumber}`}
                target="_blank"
            >
                Soundboard v{config.versionNumber}
            </a>
            <a
                href={`${config.baseUrl}${config.versionSampleHash}`}
                onClick={(e) => {
                    e.preventDefault();
                    playRandomSampleByHash(config.versionSampleHash);
                }}
            >
                {config.versionName}
            </a>
        </div>
    );
}
