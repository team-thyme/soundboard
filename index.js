if (typeof samples !== "object") {
	throw "Variable \"samples\" must be defined before running this script!";
}

//random element selection in jquery
$.fn.random = function() {
		var randomIndex = Math.floor(Math.random() * this.length);
		return jQuery(this[randomIndex]);
};

function filterSamples(query)
{
	if (!$("#searchInput").val()) {
		$("#searchInput").val(query);
	}

	if (!query)
		$(".sample").show();
	else
	{
		regexQuery = encodeURI(query.trim()).replace(/(%20|&)/g, ")(?=.*");

		$(".sample").each(function() {
			$(this).toggle(
				decodeURI($(this).data("file")).match(new RegExp("(?=.*" + regexQuery + ").+", "i")) !== null ||
				$(this).data("id") == regexQuery);
		});
	}

	if ($(".sample:visible").length)
		$("#samplesContainer").removeClass("empty");
	else
		$("#samplesContainer").addClass("empty");
}

function updatePlayerVisuals()
{
	var player = $("#player");
	var slider = $("#playerSliderBar");
	var button = $("#playerPlayStop");
	var position = $("#playerSampleInfo .position");
	var duration = player.prop("duration");

	//to prevent NaN from displaying
	if (!duration)
		duration = 0;

	//play/stop button
	if (player.prop("ended") || player.prop("paused"))
		button.addClass("play").removeClass("stop");
	else
		button.addClass("stop").removeClass("play");

	//position
	var durMins = ("0" + Math.floor(duration / 60)).slice(-2);
	var durSecs = ("0" + Math.floor(duration % 60)).slice(-2);
	var curMins = ("0" + Math.floor(player.prop("currentTime") / 60)).slice(-2);
	var curSecs = ("0" + Math.floor(player.prop("currentTime") % 60)).slice(-2);
	position.text(curMins + ":" + curSecs + " / " + durMins + ":" + durSecs);
}

function updatePlayerSlider() {
	var player = $("#player");
	var slider = $("#playerSliderBar");
	var duration = player.prop("duration");
	var percentage;

	if (!duration)
		percentage = 0;
	else
		percentage = 100 / duration * player.prop("currentTime");

	slider.css("width", percentage + "%");

	if (!player.prop("ended") && !player.prop("paused"))
		requestAnimationFrame(updatePlayerSlider);
}

function getQuery()
{
	return decodeURI(location.href.substring(location.href.lastIndexOf("/") + 1));
}

function playSample(sampleElement)
{
	var sample = $(sampleElement);
	var file = "samples/" + sample.data("file");
	var player = $("#player");
	var id = $(sampleElement).data("id");

	console.log("Playing " + id + ".");

	//dont change source if its the same, so it can be replayed instantly
	if (player.attr("src") != file)
	{
		player.attr("src", file);

		//update player sample info
		$("#playerSampleInfo .name").text(sample.data("name"));
		$("#playerSampleInfo .location").text(sample.data("location"));
	}
	else
		player[0].currentTime = 0;

	player.trigger("play");

	if (history.state === undefined || history.state.id != id) {
		console.log("Pushing state " + id + " to history.");
		history.pushState({ id: id }, "", id);
	}
}

function playRandomSample(samples)
{
	if (!samples) {
		samples = $(".sample:visible");
	}

	if (!samples.length) {
		ttsQuery();
		return;
	}

	playSample(samples.random());
}

//load tts voices
var availableVoices = [];
var voicesInitialized = false;
speechSynthesis.onvoiceschanged = function() {
	availableVoices = speechSynthesis.getVoices();
	voicesInitialized = true;
};

/**
 * TTS's the query. Obviously in JP's language where possible.
 */
function ttsQuery(retries = 1) {
	var query = $("#searchInput").val();

	if (query) {
		//wait till voices become available
		if (!voicesInitialized && retries < 5) {
			setTimeout(function() {
				ttsQuery(++retries);
			}, 200);
			return;
		}

		var voice = availableVoices.find(function (voice) {
			return voice.lang == "ja-JP";
		});

		//alright, you win. we'll use a random voice
		if (!voice) {
			voice = availableVoices[Math.floor(Math.random() * availableVoices.length)];
		}

		var utterance = new SpeechSynthesisUtterance();

		utterance.text = query;
		utterance.voice = voice;
		speechSynthesis.speak(utterance);
	}
}

function mute()
{
	var player = $("#player");
	player[0].pause();
	player[0].currentTime = 0;
}

//player visjul updates
$("#player").on("durationchange playing pause ended play timeupdate", updatePlayerVisuals);

//start slider animation
$("#player").on("play", updatePlayerSlider);

//player play/stop
$("#playerPlayStop").click(function() {
	if (!$(this).parent().hasClass("disabled"))
	{
		if ($(this).hasClass("play"))
			$("#player").trigger("play");
		else
		{
			$("#player").trigger("pause");
			$("#player").prop("currentTime", 0);
		}
	}
});

//volume change
$("#playerVolume").on("input", function() {
	var volume = $(this).val();
	$("#player").prop("volume", volume);
	localStorage.soundboard_volume = volume;
});

//search; keyup accounts for backspace, search for pressing the 'x', and input for everything else
$("#searchInput").on("search input keyup focus", function(e) {
	//only filter if there has been a change in query
	filterSamples($(this).val());

	//play first shown sample on enter (or tts when there is no result)
	if (e.keyCode == 13) {
		var visibleSamples = $(".sample:visible");
		if (visibleSamples.length) {
			playSample(visibleSamples.first());
		}
		else {
			ttsQuery();
		}
	}
});

//play random
$("#playRandom").click(function() {
	playRandomSample();
});

//contribute button
$("#contribute").click(function() {
	//set src here to prevent google from hogging all the resources
	if (!$("#contributionContainer").attr("src"))
		$("#contributionContainer").attr("src", "https://docs.google.com/document/d/1tDlWfX2TtczI5IHLmffY4LPya1J1Z9ZWHW4pYlD8toM/edit?usp=sharing");

	$("#samplesContainer").toggle();
	$("#contributionContainer").toggle();

	//KEWN, I NEED A KEWN
	if ($("#contributionContainer").is(":hidden"))
		$("#contribute").text("+");
	else
		$("#contribute").text("-");
});

//populate sample container
$("#samplesContainer").empty();

samples.forEach(function(sample) {
	$("#samplesContainer").append(
		'<div class="sample" data-file="' + encodeURI(sample.file) + '" data-id="' + sample.id + '" data-name="' + sample.name + '" data-location="' + sample.location + '">' +
			"<div class='name'>" + sample.name + "</div>" +
			"<div class='location'>" + sample.location + "</div>" +
		"</div>");
});

//register for playback
$(".sample").click(function() {
	playSample(this);
});

//enable controls on play
$("#player").on("play", function() {
	$("#playerContainer").removeClass("disabled");
});

//play from url on popstate
$(window).on("popstate", function(e) {
	mute();

	if (query = getQuery())
	{
		filterSamples(query);
		playRandomSample();
	}
});

//initial play from url
if (query = getQuery())
{
	//add an empty state before initial play, so that there can be returned to a no-sample point
	history.replaceState(null, "", ".");

	filterSamples(query);
	playRandomSample();
}

//initial (stored) volume
var storedVolume = localStorage.soundboard_volume;
if (storedVolume == undefined)
	storedVolume = 1;

$("#playerVolume").val(storedVolume).trigger("input");
