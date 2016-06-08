import $ from 'jquery';

/**
 * @returns {jQuery}
 */
export function $div() {
  return $(document.createElement('div'));
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
