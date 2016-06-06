import $ from 'jquery';
import Modal from './Modal';
import ThemeSelector from './ThemeSelector';
import SettingsManager, { settingManifest } from '../helpers/SettingsManager';

class SettingsModal extends Modal {

  /** @type jQuery */
  $cancel;

  /** @type jQuery */
  $save;

  /** @type Object */
  settings

  constructor() {
    super('#settings-modal');

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

    SettingsManager.instance.setAll(settings);
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
    const settings = SettingsManager.instance.getAll();

    Object.keys(settings).forEach((key) => {
      this.settings[key].value = settings[key];
    });
  }

  buildSettings($content) {
    this.settings = {};

    const $form = $('<div />')
      .appendTo($content)
      .addClass('form');

    Object.keys(settingManifest).forEach((key) => {
      const { label, type, row = false, params } = settingManifest[key];

      const setting = this.buildSetting(type, SettingsManager.instance.get(key), params);
      this.settings[key] = setting;

      const $item = $('<div />')
        .appendTo($form)
        .addClass('form__item')
        .toggleClass('form__item--row', row);

      $('<div />')
        .appendTo($item)
        .addClass('form__label')
        .text(label);

      $('<div />')
        .appendTo($item)
        .addClass('form__control')
        .append(setting.$element);
    });
  }

  /**
   * @param type
   * @param initialValue
   * @param params
   * @returns {SettingsModal~Setting}
   */
  buildSetting(type, initialValue, params) {
    switch (type) {
      case 'theme':
        return this.buildSettingTheme(initialValue, params);

      case 'slider':
        return this.buildSettingSlider(initialValue, params);

      default:
        throw new Error(`Unknown setting type ${type}`);
    }
  }

  buildSettingTheme(initialValue) {
    const themeSelector = new ThemeSelector(initialValue);

    return {
      $element: themeSelector.$selector,
      get value() { return themeSelector.value; },
      set value(newValue) { themeSelector.value = newValue; },
    };
  }

  buildSettingSlider(initialValue, { min, max, step, multiplier }) {
    const $input = $('<input />')
      .attr({ type: 'range', min, max, step })
      .val(initialValue * multiplier);

    return {
      $element: $input,
      get value() { return $input.val() / multiplier; },
      set value(newValue) { $input.val(newValue * multiplier); },
    };
  }

}

export default SettingsModal;
