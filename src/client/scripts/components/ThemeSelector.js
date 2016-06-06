import $ from 'jquery';
import { themes } from '../helpers/ThemeManager';

class ThemeSelector {

  /** @type string */
  _value;

  /** @type jQuery */
  $selector;

  constructor(initialValue) {
    this.$selector = $('<div />')
      .addClass('theme-selector');

    Object.keys(themes).forEach((value) => {
      const $item = $('<div />')
        .appendTo(this.$selector)
        .addClass('theme-selector__item')
        .data('value', value)
        .on('click', () => {
          this.value = value;
        });

      $('<div />')
        .appendTo($item)
        .addClass('theme-selector__thumb')
        .append(this.createThumb(value));

      $('<div />')
        .appendTo($item)
        .addClass('theme-selector__label')
        .text(themes[value]);
    });

    this.value = initialValue;
  }

  createThumb(theme) {
    const $thumb = $('<div />')
      .addClass(`theme-thumb theme-thumb--${theme}`);

    // Header
    $('<div />')
      .appendTo($thumb)
      .addClass('theme-thumb__header')
      .append(
        $('<div />')
          .addClass('theme-thumb__search')
      );

    // Samples
    const $samples = ['never', 'gonna', 'give', 'you', 'up', 'let', 'down']
      .map((name) => $('<div />').addClass('theme-thumb__sample').text(name));

    $('<div />')
      .appendTo($thumb)
      .addClass('theme-thumb__sample-container')
      .append($samples);

    return $thumb;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this.$selector.find('.theme-selector__item').each(function () {
      $(this).toggleClass('theme-selector__item--selected', $(this).data('value') === value);
    });

    this._value = value;
  }

}

export default ThemeSelector;
