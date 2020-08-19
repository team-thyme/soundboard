import * as React from "react";
import { useMemo } from "react";
import { List, WindowScroller } from "react-virtualized";

import { Sample } from "../api";
import { useTextMeasurer } from "../helpers/TextMeasurer";
import SampleItem from "./SampleItem";

interface SampleListProps {
    samples: Sample[];
}

function useSampleWidths(samples: Sample[]): number[] {
    const margin = 10;
    const padding = 20;

    const nameMeasurer = useTextMeasurer('16px Times New Roman');
    const detailMeasurer = useTextMeasurer('16px Times New Roman');

    function getWidth(sample: Sample): number {
        return (
            margin +
            padding +
            Math.max(
                nameMeasurer.measureWidth(sample.name),
                detailMeasurer.measureWidth(sample.categories.join(' / ')),
            )
        );
    }

    return useMemo(() => samples.map(getWidth), [samples]);
}

function computeLayout(itemWidths: number[], maxRowWidth: number): number[][] {
    // TODO: Better layout computation. Perhaps do local search (with badness like LaTeX) after the current greedy approach.

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
    const containerWidth = 1000;
    const rowHeight = 70;

    const widths = useSampleWidths(samples);
    // TODO: Use actual width as maxRowWidth
    const layout = computeLayout(widths, containerWidth);

    return (
        <WindowScroller>
            {({ height, isScrolling, onChildScroll, scrollTop }) => (
                <List
                    width={containerWidth}
                    height={height}
                    autoHeight
                    isScrolling={isScrolling}
                    onScroll={onChildScroll}
                    scrollTop={scrollTop}
                    rowHeight={rowHeight}
                    rowCount={layout.length}
                    rowRenderer={({ index: rowIndex, style }) => (
                        <div
                            key={rowIndex}
                            className="SampleList__row"
                            style={style}
                        >
                            {layout[rowIndex].map((index) => {
                                const sample = samples[index];
                                return (
                                    <SampleItem
                                        key={sample.key}
                                        sample={sample}
                                    />
                                );
                            })}
                            {rowIndex === layout.length - 1 && (
                                <div className="SampleList__pusher" />
                            )}
                        </div>
                    )}
                />
            )}
        </WindowScroller>
    );
}
