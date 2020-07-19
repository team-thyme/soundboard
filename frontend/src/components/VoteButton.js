import { $make } from '../helpers/jquery-utils';
import Switcher from './Switcher';

class VoteButton {

    /** @type number */
    votes;

    /** @type boolean */
    voted;

    /** @type function */
    onChange;

    /** @type jQuery */
    $root;

    /** @type Switcher */
    switcher;

    /**
     * @param {number} votes
     * @param {boolean} voted
     * @param {function(number, boolean)} onChange
     */
    constructor({ votes, voted, onChange }) {
        this.votes = votes;
        this.voted = voted;
        this.onChange = onChange;

        this.$root = $make('div')
            .addClass('button button--size-small')
            .ternaryClass(voted, 'button--primary', 'button--default')
            .on('click', this.handleClick.bind(this));

        this.switcher = new Switcher();
        this.switcher.addItem($make('span').text(votes - (voted ? 1 : 0)), !voted);
        this.switcher.addItem($make('span').text(votes + (voted ? 0 : 1)), voted);
        this.$root.append(this.switcher.$root);

        $make('span')
            .addClass('material-icons button__icon')
            .text('star')
            .appendTo(this.$root);
    }

    handleClick() {
        this.votes += (this.voted ? -1 : 1);
        this.voted = !this.voted;

        this.$root.ternaryClass(this.voted, 'button--primary', 'button--default');
        this.switcher.setActive(this.voted ? 1 : 0);

        if (this.onChange) {
            this.onChange(this.votes, this.voted);
        }
    }

}

export default VoteButton;
