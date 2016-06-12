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
    sampleContainer.playRandomWithId({ id: state.id, scroll: true, addToHistory: false });
  } else {
    Player.instance.stopAll();
  }
}

function getIdFromUrl() {
  return window.location.pathname.split('/').pop();
}

$(window).on('popstate', (e) => {
  updateFromHistoryState(e.originalEvent.state);
});

// Add samples to the container
apiClient.getSamples().then((samples) => {
  sampleContainer.setSamples(samples);

  if (history.state === null) {
    const id = getIdFromUrl();
    if (id) {
      history.replaceState({ id }, '');
    }
  }

  updateFromHistoryState(history.state);
});

// Init search
const search = new Search({
  onChange: (query) => {
    sampleContainer.setQuery(query);
    sampleContainer.update();
  },

  onSubmit: (e) => {
    sampleContainer.playRandom({ e, scroll: true, addToHistory: true });
  },
});

// Action buttons
$('[data-action="show-settings-modal"]').on('click', () => {
  settingsModal.show();
});

$('[data-action="show-contribution-modal"]').on('click', () => {
  window.open(config.contributeUrl, '_blank');
});

$('[data-action="show-changelog-modal"]').on('click', () => {
  window.open(config.repositoryUrl, '_blank');
});

$('[data-action="play-version-sample"]').on('click', () => {
  sampleContainer.playRandomWithId({ id: config.versionSampleId })
});

// Play random sample on space
$(window).on('keydown', (e) => {
  if (e.which === 32) {
    e.preventDefault();
    Player.instance.stopAll();
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

// Version in settings modal
$('.version__number').text(`v${config.versionNumber}`);
$('.version__name').text(config.versionName);
