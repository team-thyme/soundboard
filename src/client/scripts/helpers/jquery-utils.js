import $ from 'jquery';

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
