import { Sample } from '../api';

const sortLimit = new Date().getTime() - 14 * 24 * 60 * 60 * 1000;

export function sortSamples(samples: Sample[]): void {
    samples.sort((sample1, sample2) => {
        if (sample1.mtime > sortLimit || sample2.mtime > sortLimit) {
            return sample2.mtime - sample1.mtime;
        }
        return 2 * Math.floor(2 * Math.random()) - 1;
    });
}
