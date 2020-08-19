import * as React from 'react';
import { Sample } from '../api';

export interface SampleItemProps {
    sample: Sample;
}

export default function SampleItem({ sample }: SampleItemProps) {
    return (
        <div
            className="SampleItem"
            tabIndex={0}
            role="button"
            onClick={() => {
                console.log('play', sample);
            }}
        >
            <span className="SampleItem__name">{sample.name}</span>
            <span className="SampleItem__detail">
                {sample.categories.join(' / ')}
            </span>
        </div>
    );
}
