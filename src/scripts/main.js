import 'whatwg-fetch';
import $ from 'jquery';
import 'jquery-contextmenu';

import configPromise from './config';
import ApiClient from './helpers/ApiClient';
import SettingsManager from './helpers/SettingsManager';
import ThemeManager from './helpers/ThemeManager';
import Player from './helpers/Player';
import SampleContainer from './components/SampleContainer';
import Search from './components/Search';
import Modal from './components/Modal';
import SettingsModal from './components/SettingsModal';
import RequestModal from './components/RequestModal';

configPromise.then((config) => {
  const apiClient = new ApiClient(config.apiBaseUrl);

  SettingsManager.init();
  ThemeManager.init();
  Player.init();

  const settingsModal = new SettingsModal();
  // const requestModal = new RequestModal();

  // TODO: Remove debug code
  // settingsModal.show();
  // requestModal.show();

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
      sampleContainer.playRandom({ scroll: true, addToHistory: true, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey });
    },
  });

  // Action buttons
  $('[data-action="show-settings-modal"]').on('click', () => {
    settingsModal.show();
  });

  $('[data-action="show-contribution-modal"]').on('click', () => {
    // requestModal.show();
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
    if (e.which === 32 && !Modal.isModalActive()) {
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
    'meme'
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
  $('[data-content=version-number]').text(`v${config.versionNumber}`);
  $('[data-content=version-name]').text(config.versionName);

  $.contextMenu({
      "selector": ".sample",
      "items": {
          "foo": {
              "name": "Asdf", "callback": (key, opt) => { alert(key + " " + opt); }
          }
      }
  })
});
