import * as React from 'react';
import { Sample } from '../api';

export interface SampleItemProps {
    sample: Sample;
}

export default function SampleItem({ sample }: SampleItemProps) {
    return (
        <div className="SampleItem">
            <span className="SampleItem__name">{sample.name}</span>
            <span className="SampleItem__categories">
                {sample.categories.join(' / ')}
            </span>
        </div>
    );
}
