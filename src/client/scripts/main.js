import 'whatwg-fetch';
import $ from 'jquery';

import config from './config';
import ApiClient from './helpers/ApiClient';
import SettingsManager from './helpers/SettingsManager';
import ThemeManager from './helpers/ThemeManager';
import Player from './helpers/Player';
import SampleContainer from './components/SampleContainer';
import Search from './components/Search';
import SettingsModal from './components/SettingsModal';

const apiClient = new ApiClient(config.apiBaseUrl);

SettingsManager.init();
ThemeManager.init();
Player.init();

const settingsModal = new SettingsModal();

// TODO: Remove debug code
// settingsModal.show();

const sampleContainer = new SampleContainer();

// History
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function updateFromHistoryState(state) {
  if (state !== null && state.id) {
    const $sample = sampleContainer.playRandomWithId(state.id);
    const sampleTop = $sample.offset().top;

    $('body').animate({
      scrollTop: sampleTop - 100,
    });
  }
}

$(window).on('popstate', (e) => {
  updateFromHistoryState(e.originalEvent.state);
});

// Add samples to the container
apiClient.getSamples().then((samples) => {
  sampleContainer.setSamples(samples);
  updateFromHistoryState(history.state);
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

// Action buttons
$('[data-action="show-settings-modal"]').on('click', () => {
  settingsModal.show();
});

$('[data-action="show-contribution-modal"]').on('click', () => {
  window.open(config.contributeUrl, '_blank');
});

// Play random sample on space
$(window).on('keydown', (e) => {
  if (e.which === 32) {
    e.preventDefault();
    sampleContainer.playRandom(e);
  }
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
