import system from '../../system.json';

let configPromise;

export default async function getConfig() {
    if (configPromise) {
        return configPromise;
    }

    configPromise = fetch('config.json').then((response) => {
        if (!response.ok) {
            throw new Error('Could not fetch public config.');
        }

        // Merge system and public config
        return response.json().then((config) => ({...system, ...config}));
    });

    return configPromise;
};
