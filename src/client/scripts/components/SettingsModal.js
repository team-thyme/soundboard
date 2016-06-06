import $ from 'jquery';
import Modal from './Modal';
import ThemeSelector from './ThemeSelector';

class SettingsModal extends Modal {

  /** @type SettingsManager */
  settingsManager;

  /** @type jQuery */
  $cancel;

  /** @type jQuery */
  $save;

  /** @type Object */
  settings

  constructor(settingsManager) {
    super('#settings-modal');

    this.settingsManager = settingsManager;

    this.buildSettings(this.$modal.find('.modal__content'));

    // Footer buttons
    this.$cancel = this.$modal.find('[data-action=cancel]');
    this.$save = this.$modal.find('[data-action=save]');

    this.$cancel.on('click', () => {
      this.hide();
    });

    this.$save.on('click', () => {
      this.save();
      this.hide();
    });
  }

  save() {
    const settings = {};

    Object.keys(this.settings).forEach((key) => {
      settings[key] = this.settings[key].value;
    });

    this.settingsManager.setAll(settings);
  }

  show() {
    this.updateSettings();
    super.show();
  }

  /**
   * @typedef {Object} SettingsModal~Setting
   * @property {jQuery} $element
   * @property {} value
   */

  updateSettings() {
    const settings = this.settingsManager.getAll();

    Object.keys(settings).forEach((key) => {
      this.settings[key].value = settings[key];
    });
  }

  buildSettings($content) {
    const settings = this.settingsManager.getAll();
    this.settings = {};

    Object.keys(settings).forEach((key) => {
      const setting = this.buildSetting(key, settings[key]);
      setting.$element.appendTo($content);
      this.settings[key] = setting;
    });
  }

  buildSetting(key, value) {
    switch (key) {
      case 'theme':
        return this.buildThemeSelector(value);

      default:
        throw new Error(`Unknown setting ${key}`);
    }
  }

  buildThemeSelector(initialValue) {
    const themeSelector = new ThemeSelector(initialValue);

    return {
      $element: themeSelector.$selector,
      get value() {
        return themeSelector.value;
      },
      set value(newValue) {
        themeSelector.value = newValue;
      },
    };
  }

}

export default SettingsModal;
