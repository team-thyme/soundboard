import $ from 'jquery';
import SettingsManager from './SettingsManager';

export const themes = {
  default: { name: 'Default', primaryColor: '#25b192' },
  classic: { name: 'Classic', primaryColor: '#4caf50' },
  thyme: { name: 'Thyme', primaryColor: '#000' },
  cirkeltrek: { name: 'Cirkeltrek', primaryColor: '#e27000' },
};

class ThemeManager {

  /** @type ThemeManager */
  static instance;

  $meta;

  static init() {
    this.instance = new ThemeManager();
  }

  constructor() {
    this.$meta = $('<meta />')
      .attr('name', 'theme-color')
      .appendTo(document.head);

    SettingsManager.instance.on('theme', () => {
      this.updateTheme();
    });

    this.updateTheme();
  }

  updateTheme() {
    const theme = SettingsManager.instance.get('theme');

    Object.keys(themes).forEach((key) => {
      $('body').toggleClass(`theme--${key}`, key === theme);
    });

    this.$meta.attr('content', themes[theme].primaryColor);
  }

}

export default ThemeManager;
