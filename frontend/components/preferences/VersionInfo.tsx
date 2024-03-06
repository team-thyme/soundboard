import { type JSX } from 'react';

import config from '../../config';

export function VersionInfo(): JSX.Element {
    return (
        <div className="VersionInfo">
            <a
                href={`${config.repositoryUrl}/releases/tag/v${config.versionNumber}`}
                target="_blank"
            >
                Soundboard v{config.versionNumber}
            </a>
            <a
                href={`${config.baseUrl}${config.versionSampleId}`}
                onClick={(e) => {
                    e.preventDefault();
                    // TODO: Play sample
                }}
            >
                {config.versionName}
            </a>
        </div>
    );
}
