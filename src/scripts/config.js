import system from '../../system.json';

export default fetch('config.json').then(response => {
    if (!response.ok) {
        throw new Error("Could not fetch public config.");
    }

    return response.json().then(config => {
        // Merge system and public config
        return Object.assign(system, config);
    });
}).catch(() => {
    throw new Error("Could not fetch public config.");
});
