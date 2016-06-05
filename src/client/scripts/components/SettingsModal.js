import $ from 'jquery';
import Modal from './Modal';

class SettingsModal extends Modal {

  /** @type SettingsManager */
  settingsManager;

  constructor(settingsManager) {
    super('#settings-modal');

    this.settingsManager = settingsManager;
  }

}

export default SettingsModal;
