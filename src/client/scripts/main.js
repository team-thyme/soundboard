import $ from 'jquery';
import ApiClient from './helpers/ApiClient';
import SampleContainer from './components/SampleContainer';
import config from './config';

// Init API client
const apiClient = new ApiClient(config.apiBaseUrl);

// Add samples to the container
const sampleContainer = new SampleContainer();

apiClient.getSamples().then((samples) => {
  sampleContainer.setSamples(samples);
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
