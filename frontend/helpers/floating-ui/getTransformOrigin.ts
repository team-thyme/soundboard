import { Placement } from '@floating-ui/react/dist/floating-ui.react';
import {
    getAlignment,
    getAlignmentAxis,
    getSide,
    getSideAxis,
} from '@floating-ui/utils';

/**
 * Compute transform origin based on placement.
 */
export function getTransformOrigin(placement: Placement): {
    x: string;
    y: string;
} {
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
): { x: string; y: string } {
    const transformOrigin = getTransformOrigin(placement);
    return {
        x: `calc(${transformOrigin.x} - ${shift?.x ?? 0}px)`,
        y: `calc(${transformOrigin.y} - ${shift?.y ?? 0}px)`,
    };
}
