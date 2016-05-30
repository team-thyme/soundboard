import $ from 'jquery';
import { Howl, Howler } from 'howler';
import Sample from './Sample';

if (typeof window.SAMPLES === 'undefined') {
  throw new Error('Variable "window.SAMPLES" must be defined before running this script!');
}

const $sampleContainer = $('.sample-container');

window.SAMPLES.forEach((data) => {
  const sample = new Sample(data);
  $sampleContainer.append(sample.$sample);
});
