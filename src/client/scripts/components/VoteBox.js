import { $make } from '../helpers/jquery-utils';

class VoteBox {

  /** @type number */
  votes;

  /** @type boolean */
  voted;

  /** @type function(number, boolean) */
  onChange;

  /** @type jQuery */
  $root;

  /** @type jQuery */
  $votes;

  /** @type jQuery */
  $icon;

  constructor({ votes, voted, onChange }) {
    this.votes = votes;
    this.voted = voted;
    this.onChange = onChange;

    this.$root = $make('div')
      .addClass('vote-box')
      .toggleClass('vote-box--voted', voted)
      .on('click', this.handleClick.bind(this));

    this.$votes = $make('div')
      .addClass('vote-box__votes')
      .text(votes)
      .appendTo(this.$root);

    const $voteButton = $make('div')
      .addClass('vote-box__vote-button')
      .appendTo(this.$root);

    this.$icon = $make('span')
      .addClass('material-icons')
      .text(voted ? 'star' : 'star_border')
      .appendTo($voteButton);
  }

  handleClick() {
    this.votes += (this.voted ? -1 : 1);
    this.voted = !this.voted;

    this.$votes.text(this.votes);
    this.$icon.text(this.voted ? 'star' : 'star_border');

    if (this.onChange) {
      this.onChange(this.votes, this.voted);
    }
  }

}

export default VoteBox;
