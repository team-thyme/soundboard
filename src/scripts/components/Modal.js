import $ from 'jquery';
import getScrollbarWidth from '../helpers/getScrollbarWidth';

function toggleContainerScroll(disableScroll) {
    $(document.body)
        .css({
            overflow: disableScroll ? 'hidden' : '',
            marginRight: disableScroll ? getScrollbarWidth() : '',
        });
    $('.header')
        .css({
            right: disableScroll ? getScrollbarWidth() : '',
        });
}

class Modal {

    /** @type number */
    static activeModals = 0;

    /** @type jQuery */
    $modal;

    constructor(selector) {
        this.$modal = $(selector);

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
        this.$modal.toggleClass('modal--hidden', !visible);

        if (visible) {
            this.$modal.scrollTop(0);
        }

        toggleContainerScroll(Modal.isModalActive());
    }

    static isModalActive() {
        return this.activeModals > 0;
    }

}

export default Modal;
