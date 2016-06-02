import Sample from './Sample';

class ApiClient {
  constructor(baseUrl = 'api') {
    this.baseUrl = baseUrl;
  }

  getSamples() {
    return new Promise((resolve) => {
      fetch(`${this.baseUrl}/samples/list`).then((response) => {
        if (response.status === 200) {
          response.json().then((json) => {
            const samples = [];

            json.forEach((data) => {
              const modifiedData = data;

              // Make the file point back to the used api url
              modifiedData.file = `${this.baseUrl}/samples/get${modifiedData.file}`;

              samples.push(new Sample(modifiedData));
            });

            resolve(samples);
          });
        } else {
          throw new Error(`Server replied with ${response.status}`);
        }
      });
    });
  }
}

export default ApiClient;
