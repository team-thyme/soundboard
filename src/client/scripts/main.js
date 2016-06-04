import $ from 'jquery';
import ApiClient from './ApiClient';
import clientConfig from '../../../config/client.yml';

const config = clientConfig.client;

// Obtain and insert samples
const $sampleContainer = $('.sample-container');
const apiClient = new ApiClient(config.apiBaseUrl);

apiClient.getSamples().then((samples) => {
  const sortLimit = new Date().getTime() - 14 * 24 * 60 * 60 * 1000;

  samples.sort((sample1, sample2) => {
    if (sample1.mtime > sortLimit || sample2.mtime > sortLimit) {
      return sample2.mtime - sample1.mtime;
    }

    return 2 * Math.floor(2 * Math.random()) - 1;
  }).forEach((sample) => {
    $sampleContainer.append(sample.$sample);
  });
});

// Random page title
const boardNames = [
  'music',
  'spam',
  'crack',
  'shit',
  'originality',
];

const postNames = [
  'amirite',
  'correct',
  'no',
  'you see',
  'eh',
  'hmm',
];

const $title = $('title');
$title.text(
  `More like ${boardNames[Math.floor(Math.random() * boardNames.length)]}board, \
  ${postNames[Math.floor(Math.random() * postNames.length)]}?`
);
