<?php
  $files = iterator_to_array(
    new RegexIterator(
      new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator("samples")),
      "/\.(wav|mp3|ogg)$/"));

  usort($files, function($file1, $file2) { return filemtime($file1) < filemtime($file2); });

  $samples = [];

  foreach($files as $file)
  {
    $pathInfo = pathinfo($file);
    $name = preg_replace("/([^\d])\d{0,2}$/", "\\1", $pathInfo["filename"]);
    $location = substr($pathInfo["dirname"], strpos($pathInfo["dirname"], "/") + 1);
    $file = substr($file, strpos($file, "/") + 1);

    $samples[] = (object)[ "file" => (string)$file , "name" => $name, "id" => hash("crc32", $name), "location" => $location ];
  }

  $samplesJson = json_encode($samples);
?>

<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Viller's Soundboard copyright no stealerinos</title>
    <link rel="stylesheet" href="styles.css" />
    <meta name="viewport" content="initial-scale=1" />
    <link rel="shortcut icon" href="favicon.ico" />
  </head>

  <body>
    <div id="searchContainer">
      <div id="playRandom"></div>
      <input type="search" id="searchInput" placeholder="Cook, Search, Delicious!" autofocus />
      <div id="contribute">+</div>
    </div>

    <div id="playerContainer" class="disabled">
      <div id="playerPlayStop" class="play"></div>
      <div id="playerSliderContainer">
        <div id="playerSampleInfo">
          <div class="name">no sample</div>
          <div class="location"></div>
          <div class="position">00:00 / 00:00</div>
        </div>
        <div id="playerSlider"><div id="playerSliderBar"></div></div>
      </div>
      <div id="playerVolumeContainer">
        <div id="playerVolumeIcon"></div>
        <input type="range" id="playerVolume" step="0.01" max="1">
      </div>
      <audio id="player"></audio>
    </div>

    <div id="samplesContainer"></div>

    <iframe id="contributionContainer"></iframe>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script>
      //random element selection in jquery
      $.fn.random = function() {
          var randomIndex = Math.floor(Math.random() * this.length);  
          return jQuery(this[randomIndex]);
      };

      function filterSamples(query)
      {
        if (!query)
          $(".sample").show();
        else
        {
          query = encodeURI(query.trim()).toLowerCase();

          $(".sample").each(function () {
            $(this).toggle(
              $(this).data("file").toLowerCase().indexOf(query) >= 0 ||
              $(this).data("id").toString().toLowerCase() == query);
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
      
      function playFromUrl(initial)
      {
        var id = getIdFromUrl();

        //play if its a valid id
        var matchedSamples = $('.sample[data-id="' + id + '"]');
        if (matchedSamples.length)
        {
          //add an empty state before playing, so that there can be returned to a no-sample point
          if (initial)
            history.replaceState(null, "", ".");

          //trigger play
          matchedSamples.random().click();
        }
        else
        {
          //stop playing audio
          $("#player").trigger("pause");
          $("#player").prop("currentTime", 0);
        }
      }

      function getIdFromUrl()
      {
        return decodeURI(location.href.substring(location.href.lastIndexOf("/") + 1));
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
      $("#searchInput").on("search input keyup", function(e) {
        //only filter if there has been a change in query
        filterSamples($(this).val());

        //play random shown sample on enter
        if (e.keyCode == 13)
          $(".sample:visible").first().click();
      });

      //play random
      $("#playRandom").click(function() {
        $(".sample:visible").random().click();
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

      //initials
      var samples = <?php echo $samplesJson; ?>;

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
        var sample = $(this);
        var file = "samples/" + sample.data("file");
        var player = $("#player");
        var id = $(this).data("id");

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

        //only push state if not the current one
        if (id != getIdFromUrl())
          history.pushState({ id: id }, "", id);
      });

      //enable controls on play
      $("#player").on("play", function() {
        $("#playerContainer").removeClass("disabled");
      });

      //play from url on popstate
      $(window).on("popstate", function(e) {
        playFromUrl();
      });

      //initial play from url (replacing state if launched with argument)
      playFromUrl(true);

      //initial volume
      var storedVolume = localStorage.soundboard_volume;
      if (storedVolume == undefined)
        storedVolume = 1;

      $("#playerVolume").val(storedVolume).trigger("input");
    </script>
  </body>
</html>
