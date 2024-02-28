import cx from 'classnames';
import React, { useCallback, useSyncExternalStore } from 'react';

import { Sample } from '../../api';
import config from '../../config';
import download from '../../helpers/download';
import { player, type TogglePlayOptions } from '../../helpers/Player';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '../ContextMenu';
import SampleItemProgress from './SampleItemProgress';
import VisualizeAnalyserNode from './VisualizeAnalyserNode';

export interface SampleItemProps {
    sample: Sample;
}

function usePlayer(sample: Sample): {
    togglePlay(options?: TogglePlayOptions): void;
    isPlaying: boolean;
    analyserNode: AnalyserNode | null;
} {
    const playingData = useSyncExternalStore(
        (callback) => {
            player.on('play', sample.key, callback);
            player.on('ended', sample.key, callback);
            return () => {
                player.off('play', sample.key, callback);
                player.off('ended', sample.key, callback);
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

// TODO: Move sample navigation code to SampleList

type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';
type Direction = 'up' | 'down' | 'left' | 'right';

const keyToDirection: Record<ArrowKey, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
};

function navigateSample(target: HTMLElement, direction: Direction) {
    let nextTarget = null;

    switch (direction) {
        case 'left':
            nextTarget = target.previousElementSibling;
            break;
        case 'right':
            nextTarget = target.nextElementSibling;
            break;
        case 'up':
            nextTarget = findClosest(
                target,
                target.parentElement?.previousElementSibling,
            );
            break;
        case 'down':
            nextTarget = findClosest(
                target,
                target.parentElement?.nextElementSibling,
            );
            break;
    }

    if (nextTarget instanceof HTMLElement) {
        nextTarget.focus();
    }
}

function findClosest(
    target: Element,
    row: Element | undefined | null,
): Element | null {
    if (row === null || row === undefined) {
        return null;
    }

    const { left: targetMin, right: targetMax } =
        target.getBoundingClientRect();
    const targetMean = (targetMin + targetMax) / 2;

    let closest = null;
    let closestDissimilarity = Infinity;

    Array.from(row.children).forEach((child) => {
        const { left: childMin, right: childMax } =
            child.getBoundingClientRect();
        const childMean = (childMin + childMax) / 2;

        const dissimilarity =
            Math.abs(targetMean - childMean) /
            (Math.max(targetMax, childMax) - Math.min(targetMin, childMin));

        if (dissimilarity < closestDissimilarity) {
            closest = child;
            closestDissimilarity = dissimilarity;
        }
    });

    return closest;
}

export default function SampleItem({ sample }: SampleItemProps) {
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
                    onKeyDown={(e) => {
                        const { key } = e;

                        if (key in keyToDirection) {
                            e.preventDefault();
                            navigateSample(
                                e.target as HTMLElement,
                                keyToDirection[
                                    key as keyof typeof keyToDirection
                                ],
                            );
                        }
                    }}
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
