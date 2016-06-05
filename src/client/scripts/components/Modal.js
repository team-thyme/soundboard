import $ from 'jquery';

class Modal {

  /** @type jQuery */
  $modal;

  constructor(selector) {
    this.$modal = $(selector);

    this.$modal.on('touchmove wheel', (e) => {
      e.preventDefault();
    });

    this.$modal.on('click', (e) => {
      if (this.$modal.is(e.target)) {
        this.hide();
      }
    });
  }

  show() {
    this.toggle(true);
  }

  hide() {
    this.toggle(false);
  }

  toggle(visible) {
    this.$modal.toggleClass('modal--visible', visible);
  }

}

export default Modal;
