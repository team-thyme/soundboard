import $ from 'jquery';
import Modal from './Modal';

class SettingsModal extends Modal {

  /** @type SettingsManager */
  settingsManager;

  constructor(settingsManager) {
    super('#settings-modal');

    this.settingsManager = settingsManager;

    this.$cancel = this.$modal.find('[data-action=cancel]');
    this.$save = this.$modal.find('[data-action=save]');

    this.$cancel.on('click', () => {
      this.hide();
    });

    this.$save.on('click', () => {
      this.hide();
    });
  }

}

export default SettingsModal;
