import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    observeWindowRect,
    useWindowVirtualizer,
} from '@tanstack/react-virtual';
import React, {
    useCallback,
    useContext,
    useDeferredValue,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { type Sample } from '../../api';
import { player } from '../../helpers/Player';
import { Search } from '../../helpers/Search';
import { useTextMeasurer } from '../../helpers/TextMeasurer';
import {
    detailFont,
    headerHeight,
    nameFont,
    sampleHeight,
    sampleListPadding,
    sampleMargin,
    samplePaddingX,
} from '../../styles/sync-variables';
import { SamplesContext, SearchContext } from '../App';
import SampleItem from '../SampleItem/SampleItem';
import computeLayout from './computeLayout';
import { useSampleListNavigation } from './useSampleListNavigation';

/**
 * React hook. Filters a list of samples using the given query.
 */
function useFilteredSamples(samples: Sample[], query: string): Sample[] {
    const search = useMemo(() => new Search(samples), [samples]);
    return useMemo(() => search.filter(query), [search, query]);
}

/**
 * React hook. Measures the rendered width of each sample in the given list of samples.
 */
function useSampleWidths(samples: Sample[]): number[] {
    const nameMeasurer = useTextMeasurer(nameFont);
    const detailMeasurer = useTextMeasurer(detailFont);

    const getWidth = useCallback(
        (sample: Sample): number =>
            sampleMargin * 2 +
            samplePaddingX * 2 +
            Math.max(
                nameMeasurer.measureWidth(sample.name),
                detailMeasurer.measureWidth(sample.categories.join(' / ')),
            ),
        [nameMeasurer, detailMeasurer],
    );

    return useMemo(() => samples.map(getWidth), [samples, getWidth]);
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

function usePlaySamplesFromURI(
    allSamples: Sample[],
    scrollToSample: (sample: Sample) => void,
): void {
    const playedFromURI = useRef(false);
    useEffect(() => {
        if (playedFromURI.current || allSamples.length === 0) {
            return;
        }

        // Get path relative to base URI
        const path = window.location.href.substring(document.baseURI.length);
        const pathParts = path
            .split('/')
            .map((part) => part.trim())
            .filter((part) => part !== '');

        // Select samples to play
        const selectedSamples: Sample[] = [];
        pathParts.forEach((part) => {
            const matchingSamples = allSamples.filter(
                (sample) =>
                    sample.id === part && !selectedSamples.includes(sample),
            );
            if (matchingSamples.length === 0) {
                return;
            }
            const index = Math.floor(Math.random() * matchingSamples.length);
            selectedSamples.push(matchingSamples[index]);
        });

        // Don't play from URI again
        playedFromURI.current = true;

        if (selectedSamples.length === 0) {
            return;
        }

        // Play the selected samples
        selectedSamples.forEach((sample) => {
            void player.togglePlay(sample);
        });

        // Scroll to the first selected sample
        scrollToSample(selectedSamples[0]);
    }, [allSamples]);
}

export default function SampleList() {
    const { samples } = useContext(SamplesContext);

    const { query } = useContext(SearchContext);
    const deferredQuery = useDeferredValue(query);
    const filteredSamples = useFilteredSamples(samples, deferredQuery);

    const containerWidth = useBodyWidth() - sampleListPadding * 2;
    const rowHeight = sampleHeight + sampleMargin * 2;

    const widths = useSampleWidths(filteredSamples);
    const layout = useMemo(
        () => computeLayout(widths, containerWidth),
        [widths, containerWidth],
    );

    const rowVirtualizer = useWindowVirtualizer({
        count: layout.length,
        estimateSize: () => rowHeight,

        paddingStart: sampleListPadding,
        paddingEnd: sampleListPadding,

        // Account for offset caused by header & padding; otherwise the rows
        // would end up a bit lower on the page than the virtualizer expects.
        // This is very noticeable when you use a negative `overscan`.
        observeElementRect: (instance, cb) =>
            observeWindowRect(instance, ({ width, height }) =>
                cb({
                    width,
                    height: height - headerHeight,
                }),
            ),
    });

    const scrollToSample = useCallback(
        (sample: Sample) => {
            const index = filteredSamples.indexOf(sample);
            if (index === -1) {
                return;
            }
            const rowIndex = layout.findIndex((row) => row.includes(index));
            if (rowIndex === -1) {
                return;
            }
            rowVirtualizer.scrollToIndex(rowIndex, { align: 'center' });
        },
        [filteredSamples, layout],
    );

    // TODO: This is not the right place to be playing a sample from URI, but it
    //  is currently the only place we have access to all fetched samples.
    usePlaySamplesFromURI(samples, scrollToSample);

    const itemProps = useSampleListNavigation();

    if (layout.length === 0) {
        return (
            <div className="SampleList">
                <div className="SampleList__noResults">
                    <FontAwesomeIcon
                        className="SampleList__noResultsIcon"
                        icon="search"
                        size="2x"
                    />
                    <span className="SampleList__noResultsLabel">
                        How about searching for samples that do exist?
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="SampleList"
            style={{ height: rowVirtualizer.getTotalSize() }}
        >
            {rowVirtualizer
                .getVirtualItems()
                .map(({ key, index: rowIndex, start }) => (
                    <div
                        key={key}
                        className="SampleList__row"
                        style={{ top: start }}
                        role="row"
                        // Used to color rows differently in "cirkeltrek" theme
                        data-index-mod3={rowIndex % 3}
                    >
                        {layout[rowIndex].map((index) => {
                            const sample = filteredSamples[index];
                            return (
                                <SampleItem
                                    key={sample.key}
                                    sample={sample}
                                    {...itemProps}
                                />
                            );
                        })}
                        {rowIndex === layout.length - 1 && (
                            <div className="SampleList__pusher" />
                        )}
                    </div>
                ))}
        </div>
    );
}
