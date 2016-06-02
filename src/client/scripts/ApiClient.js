import Sample from './Sample';

class ApiClient {
  constructor(baseUrl = 'api') {
    this.baseUrl = baseUrl;
  }

  getSamples() {
    return new Promise((resolve) => {
      fetch(`${this.baseUrl}/samples`).then((response) => {
        if (response.status === 200) {
          response.json().then((json) => {
            const samples = [];

            json.forEach((data) => {
              samples.push(new Sample(data));
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
