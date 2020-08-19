import * as React from 'react';
import { useEffect, useState } from 'react';
import { fetchSamples, Sample } from '../api';
import SampleList from './SampleList';

function useSamples(): Sample[] {
    const [samples, setSamples] = useState([]);

    useEffect(() => {
        fetchSamples().then(setSamples);
    }, []);

    return samples;
}

export default function App() {
    const samples = useSamples();

    return (
        <div>
            <SampleList samples={samples} />
        </div>
    );
}
