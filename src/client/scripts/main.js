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

//
// // Random element selection in jQuery
// $.fn.random = function () {
//   return $(this[Math.floor(Math.random() * this.length)]);
// };
//
// function filterSamples(query) {
//   query = query.trim();
//
//   // Update search input
//   if (!$('#searchInput').val()) {
//     $('#searchInput').val(query);
//   }
//
//   let foundResults = false;
//
//   if (query === '') {
//     $('.sample').show();
//     foundResults = true;
//   } else {
//     const queryRegex = new RegExp(`(?=.*${encodeURI(query).replace(/(%20|&)/g, ')(?=.*')}).+`, 'i');
//
//     $('.sample').each(function () {
//       const id = $(this).data('id');
//       const file = $(this).data('file');
//       const active = (id === query) || (queryRegex.test(decodeURI(file)));
//
//       $(this).toggle(active);
//
//       if (active) {
//         foundResults = true;
//       }
//     });
//   }
//
//   $('#samplesContainer').toggleClass('empty', !foundResults);
// }
//
// function updatePlayerVisuals() {
//   const $player = $('#player');
//   // const $slider = $('#playerSliderBar');
//   const $button = $('#playerPlayStop');
//   const $position = $('#playerSampleInfo .position');
//
//   const duration = $player.prop('duration') || 0;
//
//   // Play/stop button
//   const $audio = $('audio');
//   let playing = false;
//
//   $audio.each(function () {
//     if (!$(this).prop('paused')) {
//       playing = true;
//     }
//   });
//
//   $button
//     .toggleClass('play', playing)
//     .toggleClass('stop', !playing);
//
//   // Position
//   const durMins = ('0' + Math.floor(duration / 60)).slice(-2);
//   const durSecs = ('0' + Math.floor(duration % 60)).slice(-2);
//   const curMins = ('0' + Math.floor($player.prop('currentTime') / 60)).slice(-2);
//   const curSecs = ('0' + Math.floor($player.prop('currentTime') % 60)).slice(-2);
//   $position.text(`${curMins}:${curSecs} / ${durMins}:${durSecs}`);
// }
//
// function updatePlayerSlider() {
//   const $player = $('#player');
//   const $slider = $('#playerSliderBar');
//
//   const duration = $player.prop('duration');
//   const percentage = duration ? (100 / duration * $player.prop('currentTime')) : 0;
//
//   $slider.css('width', `${percentage}%`);
//
//   if (!$player.prop('ended') && !$player.prop('paused')) {
//     requestAnimationFrame(updatePlayerSlider);
//   }
// }
//
// function getQuery() {
//   return decodeURI(location.href.substring(location.href.lastIndexOf('/') + 1));
// }
//
// // TODO: Fix the code below this point
//
// function playSample(sampleElement, multiple = false) {
//   var sample = $(sampleElement);
//   var file = "samples/" + sample.data("file");
//   var player = $("#player");
//   var id = $(sampleElement).data("id");
//
//   //create a new audio element to play if the current one is still playing (and shift is held down)
//   if (multiple && !player.prop("paused")) {
//     var newPlayer = player.clone();
//     newPlayer.removeProp("id").prop("volume", player.prop("volume"));
//     $("#playerContainer").append(newPlayer);
//
//     //set previous player to destroy itself when it's done
//     player.on("pause" , function() {
//       $(this).remove();
//     });
//
//     player.removeAttr("id");
//
//     //player.off("durationchange playing pause ended play timeupdate", updatePlayerVisuals);
//     //we don't need to unbind the slider animation, as it will update to the right player each frame
//
//     player = newPlayer;
//
//     //player visjul updates
//     player.on("durationchange playing pause ended play timeupdate", updatePlayerVisuals);
//
//     //start slider animation
//     player.on("play", updatePlayerSlider);
//   }
//
//   console.log("Playing " + id + ".");
//
//   //dont change source if its the same, so it can be replayed instantly
//   if (player.attr("src") != file)
//   {
//     player.attr("src", file);
//
//     //update player sample info
//     $("#playerSampleInfo .name").text(sample.data("name"));
//     $("#playerSampleInfo .location").text(sample.data("location"));
//   }
//   else
//     player[0].currentTime = 0;
//
//   player.trigger("play");
//
//   if (history.state === null || history.state.id != id) {
//     console.log("Pushing state " + id + " to history.");
//     history.pushState({ id: id }, "", id);
//   }
// }
//
// function playRandomSample(samples)
// {
//   if (!samples) {
//     samples = $(".sample:visible");
//   }
//
//   if (!samples.length) {
//     ttsQuery();
//     return;
//   }
//
//   playSample(samples.random());
// }
//
// //load tts voices
// var speechSupported = "speechSynthesis" in window;
// var availableVoices = [];
// var voicesInitialized = false;
// if (speechSupported) {
//   speechSynthesis.onvoiceschanged = function() {
//     availableVoices = speechSynthesis.getVoices();
//     voicesInitialized = true;
//   };
// }
//
// /**
//  * TTS's the query. Obviously in JP's language where possible.
//  */
// function ttsQuery(retries) {
//   if (!retries) {
//     retries = 0;
//   }
//
//   var query = $("#searchInput").val();
//
//   if (query && speechSupported) {
//     //wait till voices become available
//     if (!voicesInitialized && retries < 5) {
//       setTimeout(function() {
//         ttsQuery(++retries);
//       }, 200);
//       return;
//     }
//
//     var voice = availableVoices.find(function (voice) {
//       return voice.lang == "ja-JP";
//     });
//
//     //alright, you win. we'll use a random voice
//     if (!voice) {
//       voice = availableVoices[Math.floor(Math.random() * availableVoices.length)];
//     }
//
//     var utterance = new SpeechSynthesisUtterance();
//
//     utterance.text = query;
//     utterance.voice = voice;
//     speechSynthesis.speak(utterance);
//   }
// }
//
// function mute()
// {
//   var player = $("#player");
//   player[0].pause();
//   player[0].currentTime = 0;
// }
//
// //player visjul updates
// $("#player").on("durationchange playing pause ended play timeupdate", updatePlayerVisuals);
//
// //start slider animation
// $("#player").on("play", updatePlayerSlider);
//
// //player play/stop
// $("#playerPlayStop").click(function() {
//   if (!$(this).parent().hasClass("disabled"))
//   {
//     if ($(this).hasClass("play"))
//       $("#player").trigger("play");
//     else
//     {
//       //stop all players
//       $("audio:not(#player)").remove()
//       $("#player").trigger("pause").prop("currentTime", 0);
//     }
//   }
// });
//
// //volume change
// $("#playerVolume").on("input", function() {
//   var volume = $(this).val();
//   $("#player").prop("volume", volume);
//   localStorage.soundboard_volume = volume;
// });
//
// //search; keyup accounts for backspace, search for pressing the 'x', and input for everything else
// $("#searchInput").on("search input keyup focus", function(e) {
//   //only filter if there has been a change in query
//   filterSamples($(this).val());
//
//   //play first shown sample on enter (or tts when there is no result)
//   if (e.keyCode == 13) {
//     var visibleSamples = $(".sample:visible");
//     if (visibleSamples.length) {
//       playSample(visibleSamples.first());
//     }
//     else {
//       ttsQuery();
//     }
//   }
// });
//
// //play random
// $("#playRandom").click(function() {
//   playRandomSample();
// });
//
// //contribute button
// $("#contribute").click(function() {
//   //set src here to prevent google from hogging all the resources
//   if (!$("#contributionContainer").attr("src"))
//     $("#contributionContainer").attr("src", "https://docs.google.com/document/d/1tDlWfX2TtczI5IHLmffY4LPya1J1Z9ZWHW4pYlD8toM/edit?usp=sharing");
//
//   $("#samplesContainer").toggle();
//   $("#contributionContainer").toggle();
//
//   //KEWN, I NEED A KEWN
//   if ($("#contributionContainer").is(":hidden"))
//     $("#contribute").text("+");
//   else
//     $("#contribute").text("-");
// });
//
// //populate sample container
// $("#samplesContainer").empty();
//
// window.SAMPLES.forEach(function(sample) {
//   $("#samplesContainer").append(
//     '<div class="sample" data-file="' + encodeURI(sample.file) + '" data-id="' + sample.id + '" data-name="' + sample.name + '" data-location="' + sample.location + '">' +
//     "<div class='name'>" + sample.name + "</div>" +
//     "<div class='location'>" + (sample.location || "&nbsp;") + "</div>" +
//     "</div>");
// });
//
// //register for playback
// $(".sample").click(function(e) {
//   playSample(this, e.shiftKey);
// });
//
// //enable controls on play
// $("#player").on("play", function() {
//   $("#playerContainer").removeClass("disabled");
// });
//
// //play from url on popstate
// $(window).on("popstate", function(e) {
//   mute();
//
//   if (query = getQuery())
//   {
//     filterSamples(query);
//     playRandomSample();
//   }
// });
//
// //initial play from url
// if (getQuery())
// {
//   //add an empty state before initial play, so that there can be returned to a no-sample point
//   history.replaceState(null, "", ".");
//
//   filterSamples(getQuery());
//   playRandomSample();
// }
//
// //initial (stored) volume
// var storedVolume = localStorage.soundboard_volume;
// if (storedVolume == undefined)
//   storedVolume = 1;
//
// $("#playerVolume").val(storedVolume).trigger("input");
