import 'babel-polyfill';

import $ from 'jquery';

import configPromise from './config';
import ApiClient from './helpers/ApiClient';
import SettingsManager from './helpers/SettingsManager';
import ThemeManager from './helpers/ThemeManager';
import Player from './helpers/Player';
import SampleContainer from './components/SampleContainer';
import Search from './components/Search';
import SettingsModal from './components/SettingsModal';

SettingsManager.init();
ThemeManager.init();
Player.init();

const settingsModal = new SettingsModal();
const sampleContainer = new SampleContainer();

// Returns an array of strings representing the given path arguments relative to the base url of the index
function getArguments() {
    // Ensure baseuri is pointing to a directory
    let baseUri = document.baseURI;
    if (!baseUri.endsWith('/')) {
        baseUri = baseUri.substr(0, baseUri.lastIndexOf('/') + 1);
    }

    // Get path relative to base URI
    let argumentPath;
    if ((location.origin + location.pathname).startsWith(baseUri)) {
        argumentPath = (location.origin + location.pathname).substr(baseUri.length);
    } else {
        console.warn('Base URI does not seems to be on same origin.\nFalling back to full path for argument parsing.');
        argumentPath = location.pathname.substr(1); // Remove leading slash
    }

    // Make sure a trailing slash does not translate into an empty argument
    if (argumentPath.endsWith('/')) {
        argumentPath = argumentPath.slice(0, -1);
    }

    return argumentPath ? argumentPath.split('/') : [];
}

// Will play samples based on the arguments obtained with getArguments
function playFromArguments() {
    return new Promise((resolve) => {
        let played = 0;
        getArguments().forEach((argument) => {
            if (sampleContainer.playRandomWithId(argument, true, false, true)) {
                played += 1;
            }
        });

        resolve(played);
    });
}

// Sets given samples for the container
function setContainerSamples(samples) {
    return new Promise((resolve) => {
        sampleContainer.setSamples(samples);

        resolve(samples.length);
    });
}

// Randomized page title
const boardNames = [
    'music',
    'spam',
    'crack',
    'shit',
    'originality',
    'meme',
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
  ${postNames[Math.floor(Math.random() * postNames.length)]}?`,
);

// Action buttons
$('[data-action="show-settings-modal"]').on('click', () => {
    settingsModal.show();
});

// Init search
// eslint-disable-next-line no-unused-vars
const search = new Search({
    onChange: (query) => {
        sampleContainer.setQuery(query);
        sampleContainer.update();
    },

    onSubmit: (e) => {
        SampleContainer.playRandomVisible(e.shiftKey, e.ctrlKey, true);
    },
});

// Wait for config to register samples and set some other values
configPromise.then((config) => {
    const apiClient = new ApiClient(config.apiBaseUrl);

    // Get samples and add them to the container
    apiClient.getSamples()
        .then(setContainerSamples)
        .then(playFromArguments);

    // Modals
    $('[data-action="show-contribution-modal"]').on('click', () => {
        window.open(config.contributeUrl, '_blank');
    });

    $('[data-action="show-changelog-modal"]').on('click', () => {
        window.open(config.repositoryUrl, '_blank');
    });

    $('[data-action="play-version-sample"]').on('click', () => {
        sampleContainer.playRandomWithId(config.versionSampleId);
    });

    // Version in settings modal
    $('[data-content=version-number]').text(`v${config.versionNumber}`);
    $('[data-content=version-name]').text(config.versionName);
});
