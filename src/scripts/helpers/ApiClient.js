class ApiClient {

  constructor(baseUrl = 'api') {
    this.baseUrl = baseUrl;
  }

  getSamples() {
    return fetch(`${this.baseUrl}/samples`)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }

        throw new Error(`Server replied with ${response.status}`);
      })
      .then((json) => json.samples.map((data) => {
        /* eslint-disable no-param-reassign */

        // Javascript's timestamp uses milliseconds
        data.mtime = 1000 * data.mtime;

        return data;

        /* eslint-enable no-param-reassign */
      }));
  }

}

export default ApiClient;
