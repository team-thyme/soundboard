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

    this.$input.on('input', this.handleChange.bind(this));
  }

  handleChange() {
    const newQuery = this.$input.val().trim();

    if (newQuery !== this.query) {
      this.onChange(newQuery);
      this.query = newQuery;
    }
  }

}

export default Search;
