import $ from 'jquery';
import { $div } from '../helpers/jquery-utils';
import Modal from './Modal';
import Table from './Table';

const requests = [
  {
    request: 'louis van gaal',
    date: new Date('2016-06-07 12:04'),
    votes: 2,
    voted: false,
  },
  {
    request: 'Mag ik dat zeggen?',
    date: new Date('2016-06-07 10:31'),
    votes: 4,
    voted: true,
  },
  {
    request: 'Mag ik dat zeggen?',
    date: new Date('2016-06-07 10:31'),
    votes: 4,
    voted: true,
  },
  {
    request: 'Mag ik dat zeggen?',
    date: new Date('2016-06-07 10:31'),
    votes: 4,
    voted: true,
  },
  {
    request: 'Mag ik dat zeggen?',
    date: new Date('2016-06-07 10:31'),
    votes: 4,
    voted: true,
  },
  {
    request: 'Mag ik dat zeggen?',
    date: new Date('2016-06-07 10:31'),
    votes: 4,
    voted: true,
  },
  {
    request: 'Mag ik dat zeggen?',
    date: new Date('2016-06-07 10:31'),
    votes: 4,
    voted: true,
  },
];

class RequestModal extends Modal {

  $add;

  table;

  constructor() {
    super('#request-modal');

    this.$add = this.$modal.find('[data-action=add-request]');

    this.table = new Table({
      columns: [
        {
          name: 'Request',
          renderCell($td, row) {
            $td.text(row.request);
          },
        },
        {
          name: 'Date',
          renderCell($td, row) {
            $td.text(row.date.toLocaleDateString());
          },
        },
        {
          name: 'Votes',
          renderCell($td, row) {
            $td
              .text(row.votes)
              .css('color', row.voted ? 'green' : 'gray');
          },
        },
      ],
      data: requests,
    });

    this.$modal.find('.modal__content')
      .addClass('modal__content--table')
      .append(this.table.$table);
  }

}

export default RequestModal;
