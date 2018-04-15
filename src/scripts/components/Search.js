import $ from 'jquery';
import _ from 'underscore';

class Search {

    /** @type {function} */
    onChange;

    /** @type {function} */
    onSubmit;

    /** @type {jQuery} */
    $search;

    /** @type {jQuery} */
    $input;

    /** @type {string} */
    query = '';

    constructor({ onChange, onSubmit }) {
        this.onChange = onChange;
        this.onSubmit = onSubmit;

        this.$search = $('.search');
        this.$input = $('.search__input');
        this.$clear = $('.search__clear');

        this.$search.addClass('search--empty');

        this.$input
            .on('input', _.debounce(this.handleChange, 300))
            .on('keydown', this.handleKeydown);

        this.$clear
            .on('click', () => this.$input.val('').trigger('input'));
    }

    handleChange = () => {
        const newQuery = this.$input.val().trim();

        if (newQuery !== this.query) {
            this.onChange(newQuery);
            this.query = newQuery;
        }

        this.$search.toggleClass('search--empty', this.query === '');

        return this.query;
    };

    handleKeydown = (e) => {
        e.stopPropagation();

        if (e.which === 13) {
            const query = this.handleChange();
            this.onSubmit(query, e);
        }
    };

}

export default Search;
