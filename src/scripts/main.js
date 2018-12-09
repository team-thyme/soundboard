import $ from 'jquery';
import '@babel/polyfill';
import ApiClient from './helpers/ApiClient';
import getConfig from './helpers/getConfig';
import Intern from './helpers/Intern';
import Player from './helpers/Player';
import SampleContainer from './components/SampleContainer';
import Search from './components/Search';
import SettingsManager from './helpers/SettingsManager';
import SettingsModal from './components/SettingsModal';
import ThemeManager from './helpers/ThemeManager';
import playFromUri from './helpers/playFromUri';
import randomizeTitle from './helpers/randomizeTitle';

SettingsManager.init();
ThemeManager.init();
Player.init();

Player.instance.onBlocked = () => {
    const overlay = document.querySelector('.audio-blocked-overlay');
    overlay.classList.add('audio-blocked-overlay--active');

    overlay.addEventListener('click', () => {
        overlay.classList.remove('audio-blocked-overlay--active');
        Player.instance.playBlocked();
    });
};

const settingsModal = new SettingsModal();

randomizeTitle();

// Action buttons
$('[data-action="show-settings-modal"]').on('click', () => {
    settingsModal.show();
});

const sampleContainer = new SampleContainer();
const intern = new Intern();

// Init search
new Search({
    onChange: (query) => {sampleContainer.update(query)},
    onSubmit: async (query, e) => {
        if (!await sampleContainer.playRandomVisible(e.shiftKey, e.ctrlKey, true)) {
            intern.say(query);
        }
    },
});

// Load config and use it to initialize other components
(async () => {
    const config = await getConfig();
    const apiClient = new ApiClient(config.apiBaseUrl);

    // Get samples and add them to the container
    const samples = await apiClient.getSamples();
    sampleContainer.setSamples(samples);
    playFromUri(sampleContainer);

    // Register modals that rely on configuration
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
})();
