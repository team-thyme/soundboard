import system from '../../system.json';

export default fetch('config.json').then(response => {
    if (!response.ok) {
        console.log("Could not fetch public config.");
        return;
    }

    return response.json().then(config => {
        // Merge system and public config
        return Object.assign(system, config);
    });
}).catch((error) => {
    console.log("Could not fetch public config.");
});
