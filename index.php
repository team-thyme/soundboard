<?php
  $messages = [
    "All buttons are made out of solid gold!",
    "Press enter to play the first sample!",
    "Wave files were created by Microsoft and are therefore not supported by Internet Explorer!",
    "<a href='https://docs.google.com/document/d/1qkIPAPU5D3eXhud6-7dDbTrve0oniytJuE1jpAvP9Gg/edit' target='_blank'>Contribute</a>"];

  $message = $messages[mt_rand(0, count($messages) - 1)];

  $files = iterator_to_array(
    new RegexIterator(
      new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator("samples")),
      "/\.(wav|mp3|ogg)$/"));

  shuffle($files);

  $samples = [];

  foreach($files as $file)
  {
    $pathInfo = pathinfo($file);
    $name = preg_replace("/\d+$/", "", $pathInfo["filename"]);
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
    <link rel="stylesheet" type="text/css" href="styles.css" />
    <meta name='viewport' content='initial-scale=1' />
  </head>

  <body>
    <div id="searchContainer">
      <input type="search" id="searchInput" placeholder="Cook, Search, Delicious!" autofocus/>
      <div id="playRandom"></div>
    </div>

    <div id="message">
      <?php echo $message; ?>
    </div>

    <div id="playerContainer">
      <audio id="player" controls></audio>
    </div>

    <div id="samplesContainer"></div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script>
      //random element selection
      $.fn.random = function() {
          var randomIndex = Math.floor(Math.random() * this.length);  
          return jQuery(this[randomIndex]);
      };

      var samples = <?php echo $samplesJson; ?>;

      //search
      $("#searchInput").on("search input", function(e) {
        //only filter if there has been a change in query
        filterSamples($(this).val());

        //play first shown sample on enter
        if (e.keyCode == 13)
          $(".sample:visible").first().click();
      });

      //play random
      $("#playRandom").click(function() {
        $(".sample:visible").random().click();
      });

      function populateSampleContainer()
      {
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
          var file = "samples/" + $(this).data("file");
          var player = $("#player");

          //dont change source if its the same, so it can be replayed instantly
          if (player.attr("src") != file)
            player.attr("src", file);
          else
            player[0].currentTime = 0;
          
          player[0].play();

          history.pushState(null, "", $(this).data("id"));
        });
      }

      function filterSamples(query)
      {
        if (!query)
          $(".sample").show();
        else
        {
          query = encodeURI(query.trim());

          $('.sample:not([data-file*="' + query + '"])').hide();
          $('.sample[data-file*="' + query + '"],.sample[data-id="' + query + '"]').show();
        }

        if ($(".sample:visible").length)
          $("#samplesContainer").removeClass("empty");
        else
          $("#samplesContainer").addClass("empty");          
      }

      //initial fill
      populateSampleContainer();

      //alter query based on initial url
      var initialQuery = decodeURI(location.href.substring(location.href.lastIndexOf("/") + 1));

      //click a sample that has query as the name
      if (initialQuery)
      {
        //insert in searchbox and trigger change event with enter key (play)
        var searchInput = $("#searchInput");
        searchInput.val(initialQuery);

        //trigger
        var e = $.Event("input", { keyCode: 13 })
        searchInput.trigger(e);
      }
    </script>
  </body>
</html>
