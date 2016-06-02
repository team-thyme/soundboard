import $ from 'jquery';
import ApiClient from './ApiClient';

const $sampleContainer = $('.sample-container');

const apiClient = new ApiClient();

apiClient.getSamples().then((samples) => {
  samples.forEach((sample) => {
    $sampleContainer.append(sample.$sample);
  });
});
