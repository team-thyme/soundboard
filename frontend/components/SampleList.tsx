import { useMemo } from 'react';
import * as React from 'react';

import { Sample } from '../api';
import TextMeasurer from '../helpers/TextMeasurer';
import SampleItem from './SampleItem';

interface SampleListProps {
    samples: Sample[];
}

function useTextMeasurer(font: string): TextMeasurer {
    return useMemo(() => new TextMeasurer(font), [font]);
}

function useSampleWidths(samples: Sample[]): number[] {
    const margin = 10;
    const padding = 20;

    const nameMeasurer = useTextMeasurer('16px Times New Roman');
    const detailMeasurer = useTextMeasurer('16px Times New Roman');

    function getWidth(sample: Sample): number {
        return Math.max(
            nameMeasurer.measureWidth(sample.name),
            detailMeasurer.measureWidth(sample.categories.join(' / '))
        ) + margin + padding;
    }

    return useMemo(() => samples.map(getWidth), [samples]);
}

function computeLayout(
    itemWidths: number[],
    maxRowWidth: number,
): number[][] {
    let rows = [[]];
    let rowWidth = 0;
    for (let i = 0; i < itemWidths.length; ++i) {
        if (rowWidth === 0 || rowWidth + itemWidths[i] < maxRowWidth) {
            rowWidth += itemWidths[i];
            rows[rows.length - 1].push(i);
        } else {
            rowWidth = itemWidths[i];
            rows.push([i]);
        }
    }
    return rows;
}

export default function SampleList({ samples }: SampleListProps) {
    const widths = useSampleWidths(samples);
    // TODO: Use actual width as maxRowWidth
    const layout = computeLayout(widths, 1000);

    return (
        <div className="SampleList">
            {layout.map((row, rowIndex) => (
                <div key={rowIndex} className="SampleList__row">
                    {row.map((index) => {
                        const sample = samples[index];
                        return <SampleItem key={sample.key} sample={sample} />;
                    })}
                    {(rowIndex === layout.length - 1) && (
                        <div className="SampleList__pusher" />
                    )}
                </div>
            ))}
        </div>
    );
}
