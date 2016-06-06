import $ from 'jquery';
import config from './config';
import ApiClient from './helpers/ApiClient';
import SettingsManager from './helpers/SettingsManager';
import ThemeManager from './helpers/ThemeManager';
import SampleContainer from './components/SampleContainer';
import Search from './components/Search';
import SettingsModal from './components/SettingsModal';

const apiClient = new ApiClient(config.apiBaseUrl);
SettingsManager.init();
ThemeManager.init();

const settingsModal = new SettingsModal();

// TODO: Remove debug code
// settingsModal.show();

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

  onSubmit: (e) => {
    sampleContainer.playRandom(e);
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
