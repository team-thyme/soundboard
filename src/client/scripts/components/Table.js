import $ from 'jquery';
import { $make } from '../helpers/jquery-utils';

class Table {

  /** @type Object */
  options;

  /** @type jQuery */
  $table;

  /**
   * @typedef {Object} Table~Column
   * @property {string} name
   * @property {function(jQuery, Object)} renderCell
   */

  /**
   * @param {Object} options
   * @param {Table~Column[]} [options.columns]
   * @param {Array} [options.data]
   */
  constructor(options) {
    this.options = options;

    this.$table = $make('table')
      .addClass('table');

    if (options.columns) {
      this.$thead = $make('thead')
        .appendTo(this.$table);

      const $tr = $make('tr')
        .addClass('table__row table__row--head')
        .appendTo(this.$thead);

      options.columns.forEach((column) => {
        $make('th')
          .addClass('table__head')
          .text(column.name)
          .on('click', () => {
            this.handleHeadClick();
          })
          .appendTo($tr);
      });
    }

    this.$tbody = $make('tbody')
      .appendTo(this.$table);

    if (options.data) {
      this.renderData();
    }
  }

  handleHeadClick() {
    console.log('click');
  }

  renderData() {
    const { data, columns } = this.options;

    data.forEach((row) => {
      const $tr = $make('tr')
        .addClass('table__row');

      columns.forEach((column) => {
        const $td = $make('td')
          .addClass('table__cell');
        column.renderCell($td, row);
        $td.appendTo($tr);
      });

      $tr.appendTo(this.$tbody);
    });
  }

}

export default Table;
