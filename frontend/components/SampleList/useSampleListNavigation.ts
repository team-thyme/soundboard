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

interface UseSampleListNavigationResult {
    onKeyDown: KeyboardEventHandler;
}

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
