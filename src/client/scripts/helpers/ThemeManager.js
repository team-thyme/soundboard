import $ from 'jquery';
import SettingsManager from './SettingsManager';

export const themes = {
  default: 'Default',
  classic: 'Classic',
};

class ThemeManager {

  /** @type ThemeManager */
  static instance;

  static init() {
    this.instance = new ThemeManager();

    SettingsManager.instance.on('theme', () => {
      console.log('theme');
      this.instance.updateTheme();
    });

    this.instance.updateTheme();
  }

  updateTheme() {
    const theme = SettingsManager.instance.get('theme');

    Object.keys(themes).forEach((key) => {
      $('body').toggleClass(`theme--${key}`, key === theme);
    });
  }

}

export default ThemeManager;
