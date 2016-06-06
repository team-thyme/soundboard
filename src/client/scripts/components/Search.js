import $ from 'jquery';

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
      .on('input', this.handleChange.bind(this))
      .on('keydown', this.handleKeydown.bind(this));

    this.$clear
      .on('click', () => this.$input.val('').trigger('input'));
  }

  handleChange() {
    const newQuery = this.$input.val().trim();

    if (newQuery !== this.query) {
      this.onChange(newQuery);
      this.query = newQuery;
    }

    this.$search.toggleClass('search--empty', this.query === '');
  }

  handleKeydown(e) {
    if (e.key === 'Enter') {
      this.onSubmit(e);
    }
  }

}

export default Search;
