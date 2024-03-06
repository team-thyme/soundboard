import cx from 'classnames';
import {
    type ComponentPropsWithoutRef,
    useCallback,
    useSyncExternalStore,
} from 'react';

import { type Sample } from '../../api';
import { config } from '../../config';
import { download } from '../../helpers/download';
import { player, type TogglePlayOptions } from '../../helpers/Player';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '../floating/ContextMenu';
import { SampleItemProgress } from './SampleItemProgress';
import { VisualizeAnalyserNode } from './VisualizeAnalyserNode';

export interface SampleItemProps extends ComponentPropsWithoutRef<'button'> {
    sample: Sample;
}

function usePlayer(sample: Sample): {
    togglePlay(options?: TogglePlayOptions): void;
    isPlaying: boolean;
    analyserNode: AnalyserNode | null;
} {
    const playingData = useSyncExternalStore(
        (callback) => {
            player.addEventListener(`play ${sample.key}`, callback);
            player.addEventListener(`ended ${sample.key}`, callback);
            return () => {
                player.removeEventListener(`play ${sample.key}`, callback);
                player.removeEventListener(`ended ${sample.key}`, callback);
            };
        },
        () => player.getPlayingData(sample.key),
    );

    const isPlaying = playingData !== undefined;
    const analyserNode = playingData?.analyserNode ?? null;

    const togglePlay = useCallback(
        (options: TogglePlayOptions) => {
            player.togglePlay(sample, options);
        },
        [sample],
    );

    return { togglePlay, isPlaying, analyserNode };
}

export function SampleItem(props: SampleItemProps) {
    const { sample, ...otherProps } = props;

    // TODO: Show loading indicator if it takes a long time for the sample to
    //  start playing (e.g. because the sample file or even the OGV.js library
    //  needs to be loaded).
    const { togglePlay, isPlaying, analyserNode } = usePlayer(sample);

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <button
                    className={cx('SampleItem', {
                        'SampleItem--isPlaying': isPlaying,
                    })}
                    onClick={(e) => {
                        togglePlay({
                            spam: e.shiftKey,
                            loop: e.ctrlKey,
                        });
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    {...otherProps}
                >
                    <span className="SampleItem__name">{sample.name}</span>
                    <span className="SampleItem__detail">
                        {sample.categories.join(' / ')}
                    </span>
                    {isPlaying && (
                        <>
                            <SampleItemProgress sample={sample} />
                            <VisualizeAnalyserNode
                                analyserNode={analyserNode}
                            />
                        </>
                    )}
                </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem
                    icon={isPlaying ? 'stop' : 'play'}
                    title={isPlaying ? 'Stop' : 'Play'}
                    shortcut="Click"
                    onClick={() => {
                        togglePlay();
                    }}
                />
                <ContextMenuItem
                    icon="repeat"
                    title="Loop"
                    shortcut="Ctrl + Click"
                    onClick={() => {
                        togglePlay({ loop: true });
                    }}
                />
                <ContextMenuItem
                    icon="fire"
                    title="Spam"
                    shortcut="Shift + Click"
                    onClick={() => {
                        togglePlay({ spam: true });
                    }}
                />
                <ContextMenuItem
                    icon="link"
                    title="Copy URL"
                    onClick={async () => {
                        // Get URL to sample by letting the browser resolve it relative to current hostname.
                        const anchor = document.createElement('a');
                        anchor.href = `${config.baseUrl}${sample.id}`;
                        await navigator.clipboard.writeText(anchor.href);
                    }}
                    // Clipboard API might not be available in some environments
                    // (e.g. when not using HTTPS).
                    disabled={!navigator.clipboard}
                />
                <ContextMenuItem
                    icon="download"
                    title="Download"
                    onClick={() => {
                        const fileName = decodeURIComponent(
                            sample.path,
                        ).replace(/\//g, '_');
                        void download(sample.url, fileName);
                    }}
                />
            </ContextMenuContent>
        </ContextMenu>
    );
}
