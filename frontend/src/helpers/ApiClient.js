import Sample from '../components/Sample';

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    getSamples() {
        const apiClient = this;

        return fetch(`${apiClient.baseUrl}/samples`)
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                }

                throw new Error(`Server replied with ${response.status}`);
            })
            .then(json => json.samples.map((data) => {
                const sampleData = data;

                // Javascript's timestamp uses milliseconds
                sampleData.mtime *= 1000;

                // Convert path to an absolute url
                sampleData.url = `${apiClient.baseUrl}/samples/${sampleData.path}`;

                return new Sample(sampleData);
            }));
    }

}

export default ApiClient;
