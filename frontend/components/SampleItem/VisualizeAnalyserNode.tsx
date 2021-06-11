import * as React from 'react';
import { useEffect, useRef } from 'react';

interface Props {
    analyserNode: AnalyserNode;
}

export default function VisualizeAnalyserNode({
    analyserNode,
}: Props): JSX.Element {
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
