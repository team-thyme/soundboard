import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    observeWindowOffset,
    observeWindowRect,
    useWindowVirtualizer,
} from '@tanstack/react-virtual';
import {
    type ForwardedRef,
    forwardRef,
    type JSX,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react';

import { type Sample } from '../../api';
import { useTextMeasurer } from '../../helpers/TextMeasurer';
import {
    detailFont,
    nameFont,
    sampleHeight,
    samplePaddingX,
    sampleSpacing,
} from '../../styles/sync-variables';
import { SampleItem } from '../SampleItem/SampleItem';
import { computeLayout } from './computeLayout';
import { useSampleListNavigation } from './useSampleListNavigation';

/**
 * React hook. Measures the rendered width of each sample in the given list of samples.
 */
function useSampleWidths(samples: Sample[]): number[] {
    const nameMeasurer = useTextMeasurer(nameFont);
    const detailMeasurer = useTextMeasurer(detailFont);

    const getWidth = useCallback(
        (sample: Sample): number =>
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

function getHeaderHeight(): {
    fixedHeaderHeight: number;
    totalHeaderHeight: number;
} {
    const computedStyle = window.getComputedStyle(document.documentElement);
    const fixedHeaderHeight = parseFloat(
        computedStyle.getPropertyValue('--fixed-header-height'),
    );
    const totalHeaderHeight = parseFloat(
        computedStyle.getPropertyValue('--total-header-height'),
    );
    return { fixedHeaderHeight, totalHeaderHeight };
}

interface SampleListProps {
    samples: Sample[];
}

export interface SampleListImperativeHandle {
    scrollToSample(sample: Sample): void;
}

export const SampleList = forwardRef(function SampleList(
    props: SampleListProps,
    ref: ForwardedRef<SampleListImperativeHandle>,
): JSX.Element {
    const { samples } = props;

    const rowWidth = useBodyWidth() - sampleSpacing * 2;

    const widths = useSampleWidths(samples);
    const layout = useMemo(
        () => computeLayout(widths, rowWidth, sampleSpacing),
        [widths, rowWidth],
    );

    const { fixedHeaderHeight, totalHeaderHeight } = useMemo(
        getHeaderHeight,
        [],
    );

    const rowVirtualizer = useWindowVirtualizer({
        count: layout.length,
        estimateSize: () => sampleHeight + sampleSpacing,

        paddingStart: sampleSpacing,
        paddingEnd: sampleSpacing,

        // Account for offset caused by header; otherwise the rows would end up
        // a bit lower on the page than the virtualizer expects.
        // This is very noticeable when you use a negative `overscan`.
        observeElementRect: (instance, cb) =>
            observeWindowRect(instance, ({ width, height }) => {
                cb({
                    width,
                    height: height - fixedHeaderHeight,
                });
            }),
        observeElementOffset: (instance, cb) =>
            observeWindowOffset(instance, (offsetTop) => {
                cb(offsetTop - totalHeaderHeight + fixedHeaderHeight);
            }),
    });

    const scrollToSample = useCallback(
        (sample: Sample) => {
            const index = samples.indexOf(sample);
            if (index === -1) {
                return;
            }
            const rowIndex = layout.findIndex((row) => row.includes(index));
            if (rowIndex === -1) {
                return;
            }
            rowVirtualizer.scrollToIndex(rowIndex, { align: 'center' });
        },
        [samples, layout],
    );

    useImperativeHandle(ref, () => ({ scrollToSample }), [scrollToSample]);

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
            role="grid"
            aria-label="Grid of samples"
            aria-readonly
        >
            {rowVirtualizer
                .getVirtualItems()
                .map(({ key, index: rowIndex, start }) => (
                    <div
                        key={key}
                        className="SampleList__row"
                        style={{ top: start }}
                        role="row"
                        aria-rowindex={rowIndex + 1}
                        // Used to color rows differently in "cirkeltrek" theme
                        data-index-mod3={rowIndex % 3}
                    >
                        {layout[rowIndex].map((index) => {
                            const sample = samples[index];
                            return (
                                <div
                                    key={sample.key}
                                    className="SampleList__item"
                                    role="gridcell"
                                >
                                    <SampleItem
                                        sample={sample}
                                        {...itemProps}
                                    />
                                </div>
                            );
                        })}
                        {rowIndex === layout.length - 1 && (
                            <div className="SampleList__pusher" />
                        )}
                    </div>
                ))}
        </div>
    );
});
