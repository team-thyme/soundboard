class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getSamples() {
    let apiClient = this;

    return fetch(`${apiClient.baseUrl}/samples`)
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

        // Convert path to an absolute url
        data.url = apiClient.baseUrl + '/samples/' + data.path;

        return data;

        /* eslint-enable no-param-reassign */
      }));
  }

}

export default ApiClient;
