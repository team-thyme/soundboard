import $ from 'jquery';
import { $make } from '../helpers/jquery-utils';

class Table {

  /** @type Object */
  options;

  /** @type jQuery */
  $table;

  /** @type Table~Column[] */
  columns;

  /** @type Object[] */
  rows;

  /** @type number */
  sortIndex;

  /** @type number */
  sortDirection;

  /**
   * @typedef {Object} Table~Column
   * @property {string} name
   * @property {function(jQuery, Object)} renderCell
   * @property {bool} [sortable=false]
   * @property {function(Object, Object)} [sort]
   * @property {string} [align="left"]
   * @property {bool} [autoWidth=false]
   *
   * @property {jQuery} [$head]
   * @property {jQuery} [$sortIcon]
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

      this.columns = options.columns.map((column, i) => {
        const result = { ...column };

        const $headContent = $make('div')
          .addClass('table__head-content')
          .append($make('div').addClass('table__head-label').text(column.name));

        const $head = $make('th')
          .addClass('table__head')
          .addClass(`table__head--align-${column.align || 'left'}`)
          .toggleClass('table__head--auto-width', column.autoWidth === true)
          .toggleClass('table__head--sortable', column.sortable === true)
          .on('click', () => { this.handleHeadClick($head, column, i); })
          .append($headContent)
          .appendTo($tr);

        result.$head = $head;

        if (column.sortable) {
          const $sortIcon = $make('div')
            .addClass('table__sort-icon material-icons')
            .text('arrow_downward')
            .appendTo($headContent);
          result.$sortIcon = $sortIcon;
        }

        return result;
      });
    }

    this.$tbody = $make('tbody')
      .appendTo(this.$table);

    if (options.data) {
      this.renderData();
    }
  }

  renderData() {
    const { data, columns } = this.options;

    this.rows = data.map((rowData, i) => {
      const $row = $make('tr')
        .addClass('table__row');

      columns.forEach((column) => {
        const $cell = $make('td')
          .addClass('table__cell')
          .addClass(`table__cell--align-${column.align || 'left'}`);
        column.renderCell($cell, rowData, i);
        $cell.appendTo($row);
      });

      $row.appendTo(this.$tbody);

      return {
        $row,
        data: rowData,
      };
    });
  }

  handleHeadClick($head, column, i) {
    if (column.sortable) {
      this.sort(i);
    }
  }

  sort(sortIndex) {
    const sortColumn = this.columns[sortIndex];

    // Get sort direction
    const direction = (this.sortIndex === sortIndex) ? -this.sortDirection : 1;
    this.sortIndex = sortIndex;
    this.sortDirection = direction;

    this.updateSort();

    // Update column heads
    this.columns.forEach((column, i) => {
      column.$head
        .toggleClass('table__head--sort', (sortIndex === i))
        .toggleClass('table__head--sort--ascending', (sortIndex === i) && (direction === 1))
        .toggleClass('table__head--sort--descending', (sortIndex === i) && (direction === -1));

      if (sortIndex === i) {
        column.$sortIcon.text(direction === 1 ? 'arrow_downward' : 'arrow_upward');
      } else {
        column.$sortIcon.text('arrow_downward');
      }
    });
  }

  updateSort() {
    if (typeof this.sortIndex === 'undefined') {
      return;
    }

    const sortColumn = this.columns[this.sortIndex];
    const direction = this.sortDirection;

    // Sort
    this.rows.sort((row1, row2) => direction * sortColumn.sort(row1.data, row2.data));

    // Update rows
    this.$tbody.find('.table__row').detach();
    this.rows.forEach((row) => {
      this.$tbody.append(row.$row);
    });
  }

}

export default Table;
