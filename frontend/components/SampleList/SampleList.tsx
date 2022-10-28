import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {
    useCallback,
    useContext,
    useDeferredValue,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

import { fetchSamples, Sample } from '../../api';
import { player } from '../../helpers/Player';
import { useTextMeasurer } from '../../helpers/TextMeasurer';
import {
    detailFont,
    nameFont,
    sampleHeight,
    sampleListPadding,
    sampleMargin,
    samplePaddingX,
} from '../../styles/sync-variables';
import { SearchContext } from '../App';
import SampleItem from '../SampleItem/SampleItem';
import computeLayout from './computeLayout';

/**
 * React hook. Fetches samples from API, if needed.
 */
function useSamples(): Sample[] {
    const [samples, setSamples] = useState<Sample[]>([]);

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
    // Only word- and whitespace-chars are allowed in the indices and query
    const ALLOWED_CHARS_REGEX = /[^\w\s]/g;

    // Prepare the normalized sample index. The sample don't generally change,
    // so most of the time we only have to do this once.
    //
    // Example:
    // { name: 'tof', categories: ['voice', 'skik'] } => 'tof voice skik'
    const indexedSamples = useMemo(() => {
        return samples.map((sample) => {
            let string = sample.name.replace(ALLOWED_CHARS_REGEX, '');
            sample.categories.forEach((category) => {
                string += ' ' + category.replace(ALLOWED_CHARS_REGEX, '');
            });
            return string.toLowerCase();
        });
    }, [samples]);

    return useMemo(() => {
        // Normalize the query to match the prepared sample indices
        const normalizedQuery = query
            .replace(ALLOWED_CHARS_REGEX, '')
            .toLowerCase()
            .trim();

        // Early return for empty queries
        if (normalizedQuery === '') {
            return samples;
        }

        // Split the query into an array of terms
        const terms = normalizedQuery.split(/[\s+&]+/g);

        return samples.filter((sample, index) => {
            // Every term must be included in the sample text
            return terms.every((term) => indexedSamples[index].includes(term));
        });
    }, [samples, indexedSamples, query]);
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

function usePlaySamplesFromURI(allSamples: Sample[]): void {
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
            const index = Math.floor(Math.random() * matchingSamples.length);
            selectedSamples.push(matchingSamples[index]);
        });

        // Play the selected samples
        selectedSamples.forEach((sample) => {
            player.togglePlay(sample);
        });

        // Don't play from URI again
        playedFromURI.current = true;
    }, [allSamples]);
}

export default function SampleList() {
    const allSamples = useSamples();

    // TODO: This is not the right place to be playing a sample from URI, but it
    //  is currently the only place we have access to all fetched samples.
    usePlaySamplesFromURI(allSamples);

    const { query } = useContext(SearchContext);
    const deferredQuery = useDeferredValue(query);
    const samples = useFilteredSamples(allSamples, deferredQuery);

    const containerWidth = useBodyWidth() - sampleListPadding * 2;
    const rowHeight = sampleHeight + sampleMargin * 2;

    const widths = useSampleWidths(samples);
    const layout = useMemo(
        () => computeLayout(widths, containerWidth),
        [widths, containerWidth],
    );

    // TODO: Account for offset caused by header & padding; as it stands the rows
    //  end up a bit lower on the page than the virtualizer expects. This is very
    //  noticeable when you use a negative `overscan`.
    const rowVirtualizer = useWindowVirtualizer({
        count: layout.length,
        estimateSize: () => rowHeight,
        paddingEnd: sampleListPadding,
    });

    // Force range recalculation, since the range is not calculated correctly on
    // the first render.
    // TODO: Find another way to fix this.
    // @ts-expect-error TS2341: calculateRange() is a private method
    rowVirtualizer.calculateRange();

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
                .map(({ index: rowIndex, start }) => (
                    <div
                        key={rowIndex}
                        className="SampleList__row"
                        style={{ top: start }}
                        role="row"
                        // Used to color rows differently in "cirkeltrek" theme
                        data-index-mod3={rowIndex % 3}
                    >
                        {layout[rowIndex].map((index) => {
                            const sample = samples[index];
                            return (
                                <SampleItem key={sample.key} sample={sample} />
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
