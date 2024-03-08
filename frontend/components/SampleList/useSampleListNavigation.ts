import {
    type KeyboardEvent,
    type KeyboardEventHandler,
    useCallback,
} from 'react';

type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';
type Direction = 'up' | 'down' | 'left' | 'right';

const keyToDirection: Record<ArrowKey, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
};

const SAMPLE_SELECTOR = '.SampleItem';
const ITEM_SELECTOR = '.SampleList__item';
const ROW_SELECTOR = '.SampleList__row';

function navigateSample(sample: HTMLElement, direction: Direction) {
    const item = sample.closest(ITEM_SELECTOR) as HTMLElement;
    const row = item.closest(ROW_SELECTOR) as HTMLElement;

    let nextSample;
    switch (direction) {
        case 'left':
            nextSample =
                item.previousElementSibling?.querySelector(SAMPLE_SELECTOR);
            break;
        case 'right':
            nextSample =
                item.nextElementSibling?.querySelector(SAMPLE_SELECTOR);
            break;
        case 'up':
            nextSample = findClosest(sample, row.previousElementSibling);
            break;
        case 'down':
            nextSample = findClosest(sample, row.nextElementSibling);
            break;
    }

    if (nextSample instanceof HTMLElement) {
        nextSample.focus();
    }
}

function findClosest(sample: Element, row: Element | null): Element | null {
    if (row === null) {
        return null;
    }

    const { left: targetMin, right: targetMax } =
        sample.getBoundingClientRect();
    const targetMean = (targetMin + targetMax) / 2;

    let closestSample = null;
    let closestDissimilarity = Infinity;

    Array.from(row.querySelectorAll(SAMPLE_SELECTOR)).forEach((otherSample) => {
        const { left: otherSampleMin, right: otherSampleMax } =
            otherSample.getBoundingClientRect();
        const otherSampleMean = (otherSampleMin + otherSampleMax) / 2;

        const dissimilarity =
            Math.abs(targetMean - otherSampleMean) /
            (Math.max(targetMax, otherSampleMax) -
                Math.min(targetMin, otherSampleMin));

        if (dissimilarity < closestDissimilarity) {
            closestSample = otherSample;
            closestDissimilarity = dissimilarity;
        }
    });

    return closestSample;
}

interface UseSampleListNavigationResult {
    onKeyDown: KeyboardEventHandler;
}

/**
 * TODO: Documentation
 *
 * Assumes the following structure in the DOM:
 *
 * ```html
 * <div class="SampleList">
 *     <div class="SampleList__row">
 *         <div class="SampleList__item">
 *             <button class="SampleItem">...</button> <!-- Target -->
 *         </div>
 *         ...
 *     </div>
 *     ...
 * </div>
 * ```
 */
export function useSampleListNavigation(): UseSampleListNavigationResult {
    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const { key } = event;

            if (key in keyToDirection) {
                event.preventDefault();
                navigateSample(
                    event.target as HTMLElement,
                    keyToDirection[key as keyof typeof keyToDirection],
                );
            }
        },
        [navigateSample],
    );

    return { onKeyDown };
}
