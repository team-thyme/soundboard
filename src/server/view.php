<!-- If this doesn't work you're probably using an inferior browser. -->
<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="initial-scale=1" />

    <title><?php echo $title ?></title>

    <link rel="stylesheet" href="build/style.css" />
    <link rel="shortcut icon" href="favicon.ico" />

    <script>
      // Set samples for the script
      var samples = <?php echo json_encode($samples) ?>;
    </script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js" defer></script>
    <script src="index.js" defer></script>
  </head>

  <body>
    <div id="searchContainer">
      <div id="playRandom"></div>
      <input type="search" id="searchInput" placeholder="Cook, Search, Delicious!" />
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
  </body>
</html>
