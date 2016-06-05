import $ from 'jquery';
import ApiClient from './helpers/ApiClient';
import SettingsManager from './helpers/SettingsManager';
import SampleContainer from './components/SampleContainer';
import Search from './components/Search';
import SettingsModal from './components/SettingsModal';
import config from './config';

const apiClient = new ApiClient(config.apiBaseUrl);
const settingsManager = new SettingsManager();
const settingsModal = new SettingsModal(settingsManager);

// Add samples to the container
const sampleContainer = new SampleContainer();

apiClient.getSamples().then((samples) => {
  sampleContainer.setSamples(samples);
});

// Init search
const search = new Search({
  onChange: (query) => {
    sampleContainer.setQuery(query);
    sampleContainer.update();
  },
});

// Settings button
$('[data-action="show-settings-modal"]').on('click', () => {
  settingsModal.show();
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
