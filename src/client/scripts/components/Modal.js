import $ from 'jquery';

class Modal {

  /** @type number */
  static activeModals = 0;

  /** @type jQuery */
  $modal;

  constructor(selector) {
    this.$modal = $(selector);

    // TODO: Disable scrolling through samples when modal is active
    // this.$modal.on('touchmove wheel', (e) => {
    //   if (!e.isPropagationStopped()) {
    //     e.preventDefault();
    //   }
    // });

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
    Modal.activeModals += (visible ? 1 : -1);
    this.$modal.toggleClass('modal--visible', visible);
  }

  static isModalActive() {
    return this.activeModals > 0;
  }

}

export default Modal;
