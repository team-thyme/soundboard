import $ from 'jquery';

class Search {

  /** @type {function} */
  onChange;

  /** @type {jQuery} */
  $search;

  /** @type {jQuery} */
  $input;

  /** @type {string} */
  query = '';

  constructor({ onChange }) {
    this.onChange = onChange;

    this.$search = $('.search');
    this.$input = $('.search__input');
    this.$clear = $('.search__clear');

    this.$search.addClass('search--empty');

    this.$input.on('input', this.handleChange.bind(this));
    this.$clear.on('click', () => this.$input.val('').trigger('input').focus());
  }

  handleChange() {
    const newQuery = this.$input.val().trim();

    if (newQuery !== this.query) {
      this.onChange(newQuery);
      this.query = newQuery;
    }

    this.$search.toggleClass('search--empty', this.query === '');
  }

}

export default Search;
