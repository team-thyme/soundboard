import { Placement } from '@floating-ui/react/dist/floating-ui.react';
import {
    getAlignment,
    getAlignmentAxis,
    getSide,
    getSideAxis,
} from '@floating-ui/utils';

export interface TransformOrigin {
    x: string;
    y: string;
}

/**
 * Compute transform origin based on placement.
 */
export function getTransformOrigin(placement: Placement): TransformOrigin {
    const side = getSide(placement);
    const axis = getSideAxis(placement);
    const alignment = getAlignment(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    return {
        [axis]: side === 'top' || side === 'left' ? '100%' : '0%',
        [alignmentAxis]:
            alignment === 'start' ? '0%' : alignment === 'end' ? '100%' : '50%',
    } as { x: string; y: string };
}

/**
 * Compute transform origin based on placement and result of shift middleware.
 */
export function getShiftTransformOrigin(
    placement: Placement,
    shift?: { x: number; y: number },
): TransformOrigin {
    const transformOrigin = getTransformOrigin(placement);
    return {
        x: `calc(${transformOrigin.x} - ${shift?.x ?? 0}px)`,
        y: `calc(${transformOrigin.y} - ${shift?.y ?? 0}px)`,
    };
}

export function getArrowTransformOrigin(
    placement: Placement,
    arrow?: { x?: number; y?: number },
): TransformOrigin {
    const transformOrigin = getTransformOrigin(placement);

    if (arrow?.x) {
        transformOrigin.x = `${arrow.x}px`;
    } else if (arrow?.y) {
        transformOrigin.y = `${arrow.y}px`;
    }

    return transformOrigin;
}
