import $ from 'jquery';
import { detach } from './jquery-utils';
import SettingsManager from './SettingsManager';

export const themes = {
  default: { name: 'Default', primaryColor: '#25b192' },
  classic: { name: 'Classic', primaryColor: '#4caf50' },
  thyme: { name: 'Thyme', primaryColor: '#000' },
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

    this.updateTheme(true);
  }

  updateTheme(shouldDetach = false) {
    const theme = SettingsManager.instance.get('theme');

    const $body = $('body');
    const reAttachBody = shouldDetach ? detach($body) : null;

    Object.keys(themes).forEach((key) => {
      $body.toggleClass(`theme--${key}`, key === theme);
    });

    if (shouldDetach) {
      reAttachBody();
    }

    this.$meta.attr('content', themes[theme].primaryColor);
  }

}

export default ThemeManager;
