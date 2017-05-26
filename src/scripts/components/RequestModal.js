import Modal from './Modal';
import Table from './Table';
import VoteButton from './VoteButton';

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
        votes: 10,
        voted: true,
    },
    {
        request: 'Mag ik dat zeggen?',
        date: new Date('2016-06-07 10:31'),
        votes: 11,
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

    /** @type jQuery */
    $add;

    /** @type Table */
    table;

    constructor() {
        super('#request-modal');

        this.$add = this.$modal.find('[data-action=add-request]');

        this.table = new Table({
            columns: [
                {
                    name: 'Request',
                    renderCell($td, row) {
                        $td.text(row.request)
                            .addClass('text--selectable');
                    },
                    sortable: true,
                    sort(row1, row2) {
                        return row1.request.localeCompare(row2.request);
                    },
                },
                {
                    name: 'Date',
                    renderCell($td, row) {
                        $td.text(row.date.toLocaleDateString());
                    },
                    sortable: true,
                    sort(row1, row2) {
                        return row2.date - row1.date;
                    },
                    align: 'right',
                    autoWidth: true,
                },
                {
                    name: 'Votes',
                    renderCell($td, row) {
                        const voteButton = new VoteButton({
                            votes: row.votes,
                            voted: row.voted,
                            onChange(votes, voted) {
                                /* eslint-disable no-param-reassign */
                                row.votes = votes;
                                row.voted = voted;
                                /* eslint-enable no-param-reassign */
                            },
                        });
                        $td.append(voteButton.$root);
                    },
                    sortable: true,
                    sort(row1, row2) {
                        return (row2.votes - (row2.voted ? 0.5 : 0)) - (row1.votes + (row1.voted ? 0.5 : 0));
                    },
                    align: 'right',
                    autoWidth: true,
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
