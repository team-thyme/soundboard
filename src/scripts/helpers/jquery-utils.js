import $ from 'jquery';

/**
 *
 * @function
 * @name jQuery#ternaryClass
 *
 * @param {boolean} condition
 * @param {string} class1
 * @param {string} class2
 * @returns {jQuery}
 */
$.fn.ternaryClass = (condition, class1, class2) => {
    $(this)
        .toggleClass(class1, condition)
        .toggleClass(class2, !condition);
    return this;
};

/**
 * @param {string} type
 * @returns {jQuery}
 */
export function $make(type) {
    return $(document.createElement(type));
}

/**
 * @returns {jQuery}
 */
export function $div() {
    return $make('div');
}

/**
 * @param {jQuery} $element
 * @return {function()}
 */
export function detach($element) {
    const $parent = $element.parent();
    const $prev = $element.prev();
    return () => {
        if ($prev.length !== 0) {
            $element.insertAfter($prev);
        } else {
            $element.prependTo($parent);
        }
    };
}
