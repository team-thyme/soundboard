import { $make } from '../helpers/jquery-utils';

class Switcher {

  /** @type jQuery */
  $root;

  constructor() {
    this.$root = $make('div')
      .addClass('switcher');
  }

  addItem($content, active = false) {
    return $make('div')
      .addClass('switcher__item')
      .toggleClass('switcher__item--active switcher__item--initial', active)
      .append($content)
      .appendTo(this.$root);
  }

  setActive(index) {
    const $item = this.$root
      .children()
      .removeClass('switcher__item--active switch__item--initial')
      .eq(index)
      .addClass('switcher__item--active');

    this.$root.css({
      width: $item.outerWidth(),
      height: $item.outerHeight(),
    });
  }

}

export default Switcher;
