import { $make } from './jquery-utils';

let scrollbarWidth;

function getScrollbarWidth() {
    if (typeof scrollbarWidth === 'undefined') {
        const $outer = $make('div')
            .css({
                position: 'absolute',
                top: 0,
                width: 100,
                height: 100,
                overflow: 'scroll',
            });
        const $inner = $make('div')
            .css({
                height: 200,
            });

        $outer.append($inner).appendTo(document.body);
        scrollbarWidth = 100 - $inner.outerWidth();
        $outer.remove();
    }

    return scrollbarWidth;
}

export default getScrollbarWidth;
