import * as React from 'react';
import { useEffect, useMemo, useState, useContext } from 'react';
import { List, WindowScroller } from 'react-virtualized';

import { fetchSamples, Sample } from "../api";
import { useTextMeasurer } from '../helpers/TextMeasurer';
import {
    detailFont,
    nameFont,
    sampleHeight,
    sampleListPadding,
    sampleMargin,
    samplePaddingX,
} from '../styles/sync-variables';
import { SearchContext } from "./App";
import SampleItem from './SampleItem';

/**
 * React hook. Fetches samples from API, if needed.
 */
function useSamples(): Sample[] {
    const [samples, setSamples] = useState([]);

    useEffect(() => {
        fetchSamples().then((samples) => {
            // Sort samples
            const sortLimit = new Date().getTime() - 14 * 24 * 60 * 60 * 1000;
            samples = samples.sort((sample1, sample2) => {
                if (sample1.mtime > sortLimit || sample2.mtime > sortLimit) {
                    return sample2.mtime - sample1.mtime;
                }

                return 2 * Math.floor(2 * Math.random()) - 1;
            });

            setSamples(samples);
        });
    }, []);

    return samples;
}

/**
 * React hook. Filters a list of samples using the given query.
 */
function useFilteredSamples(samples: Sample[], query: string): Sample[] {
    return useMemo(() => {
        if (query.trim() === '') {
            return samples;
        }

        // Prepare regex
        const terms = query
            // Strip non-alphanumeric characters (will be done in target as well)
            .replace(/[^\w\s|]/g, '')
            // Enable OR-searching when whitespace is around the pipe character "|"
            .replace(/\s+\|\s+/g, '|')
            // Split by any combination of whitespace characters
            .split(/[\s+&]+/g);
        const regex = new RegExp(
            `.*${terms.map((term) => `(?=.*${term}.*)`).join('')}.*`,
            'i',
        );

        return samples.filter((sample) => {
            let filterString = sample.name.replace(/[^\w\s|]/g, '');
            sample.categories.forEach((category) => {
                filterString += ' ' + category.replace(/[^\w\s|]/g, '');
            });

            return regex.test(filterString);
        });
    }, [samples, query]);
}

/**
 * React hook. Measures the rendered width of each sample in the given list of samples.
 */
function useSampleWidths(samples: Sample[]): number[] {
    const nameMeasurer = useTextMeasurer(nameFont);
    const detailMeasurer = useTextMeasurer(detailFont);

    function getWidth(sample: Sample): number {
        return (
            sampleMargin * 2 +
            samplePaddingX * 2 +
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

/**
 * React hook. Measures the width of the body element.
 */
function useBodyWidth(): number {
    const [width, setWidth] = useState(document.body.clientWidth);

    useEffect(() => {
        function handleResize() {
            setWidth(document.body.clientWidth);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
}

export default function SampleList() {
    const allSamples = useSamples();
    const { query } = useContext(SearchContext);
    const samples = useFilteredSamples(allSamples, query);

    const containerWidth = useBodyWidth() - sampleListPadding * 2;
    const rowHeight = sampleHeight + sampleMargin * 2;

    const widths = useSampleWidths(samples);
    const layout = computeLayout(widths, containerWidth);

    return (
        <WindowScroller>
            {({ height, isScrolling, onChildScroll, scrollTop }) => (
                <List
                    className="SampleList"
                    tabIndex={null}
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
