import $ from 'jquery';

const boardNames = [
    'music',
    'spam',
    'crack',
    'shit',
    'originality',
    'meme',
];

const postNames = [
    'amirite',
    'correct',
    'no',
    'you see',
    'eh',
    'hmm',
];

export default function randomizeTitle() {
    const boardName = boardNames[Math.floor(Math.random() * boardNames.length)];
    const postName = postNames[Math.floor(Math.random() * postNames.length)];

    $('title').text(`More like ${boardName}board, ${postName}?`);
};
