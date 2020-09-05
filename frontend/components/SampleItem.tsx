import { useState, useCallback, useEffect, useRef } from 'react';
import * as React from 'react';
import cx from 'classnames';
import { Sample } from '../api';
import { player } from '../helpers/Player';

export interface SampleItemProps {
    sample: Sample;
}

function usePlayer(
    sample: Sample,
): {
    togglePlay(): void;
    isPlaying: boolean;
    progress: number;
    analyserNode: AnalyserNode;
} {
    const [isPlaying, setPlaying] = useState(() =>
        player.isPlaying(sample.key),
    );
    const [progress, setProgress] = useState(() =>
        player.getProgress(sample.key),
    );
    const [analyserNode, setAnalyserNode] = useState(() =>
        player.getAnalyserNode(sample.key),
    );

    useEffect(() => {
        function handlePlay() {
            setPlaying(true);
            setAnalyserNode(player.getAnalyserNode(key));
        }
        function handleEnded() {
            setPlaying(false);
            setAnalyserNode(null);
        }
        function handleProgress() {
            setProgress(player.getProgress(key));
        }

        const { key } = sample;
        player.on('play', key, handlePlay);
        player.on('ended', key, handleEnded);
        player.on('progress', key, handleProgress);

        return () => {
            player.off('play', key, handlePlay);
            player.off('ended', key, handleEnded);
            player.off('progress', key, handleProgress);
        };
    }, [sample]);

    const togglePlay = useCallback(() => {
        player.stopAll();
        if (!player.isPlaying(sample.key)) {
            player.play(sample);
        }
    }, [sample]);

    return { togglePlay, isPlaying, progress, analyserNode };
}

function VisualizeAnalyserNode({
    analyserNode,
}: {
    analyserNode: AnalyserNode;
}) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        function step() {
            requestId = window.requestAnimationFrame(step);

            if (!analyserNode) {
                return;
            }

            const wrapper = wrapperRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Set canvas size
            const { clientWidth, clientHeight } = wrapper;
            const devicePixelRatio = window.devicePixelRatio || 1;

            const width = clientWidth * devicePixelRatio;
            const height = clientHeight * devicePixelRatio;
            const maxWidth = 1000 * devicePixelRatio;

            canvas.width = width;
            canvas.height = height;

            canvas.style.width = `${clientWidth}px`;
            canvas.style.height = `${clientHeight}px`;

            // Get data from analyser node
            const bufferLength = analyserNode.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserNode.getByteTimeDomainData(dataArray);

            // Canvas is transparent
            ctx.clearRect(0, 0, width, height);

            ctx.lineWidth = 2 * devicePixelRatio;
            ctx.strokeStyle = 'black';

            ctx.beginPath();
            // Use constant slice width for all items smaller than 1000px, after that we just scale.
            const sliceWidth = Math.max(width, maxWidth) / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * height) / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(width, height / 2);
            ctx.stroke();
        }

        let requestId = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(requestId);
    }, [analyserNode]);

    return (
        <div ref={wrapperRef} className="SampleItem__visualize">
            <canvas ref={canvasRef} />
        </div>
    );
}

export default function SampleItem({ sample }: SampleItemProps) {
    const { togglePlay, isPlaying, progress, analyserNode } = usePlayer(sample);

    return (
        <button
            className={cx('SampleItem', {
                'SampleItem--isPlaying': isPlaying,
            })}
            onClick={(e) => {
                togglePlay();
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <span className="SampleItem__name">{sample.name}</span>
            <span className="SampleItem__detail">
                {sample.categories.join(' / ')}
            </span>
            {isPlaying && (
                <>
                    <div
                        className="SampleItem__progress"
                        style={{ transform: `scaleX(${progress})` }}
                    />
                    <VisualizeAnalyserNode analyserNode={analyserNode} />
                </>
            )}
        </button>
    );
}
