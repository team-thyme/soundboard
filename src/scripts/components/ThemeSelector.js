import $ from 'jquery';
import { themes } from '../helpers/ThemeManager';
import svg from '../../theme-thumb.svg';

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
                .append(ThemeSelector.createThumb(value));

            $('<div />')
                .appendTo($item)
                .addClass('theme-selector__label')
                .text(themes[value].name);
        });

        this.value = initialValue;
    }

    static createThumb(theme) {
        return $(svg).addClass(`theme-thumb--${theme} theme-thumb--fluid`);
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this.$selector.find('.theme-selector__item').each(() => {
            $(this).toggleClass('theme-selector__item--selected', $(this).data('value') === value);
        });

        this._value = value;
    }

}

export default ThemeSelector;
