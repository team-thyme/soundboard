<?php
  //create list of samples
  $files = iterator_to_array(
    new RegexIterator(
      new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator("samples")),
      "/\.(wav|mp3|ogg)$/"));

  //sort by time modified when it is within the last two weeks
  $sortLimit = time() - 14 * 24 * 60 * 60;

  usort($files, function($file1, $file2) use ($sortLimit) {
    $mtime1 = filemtime($file1);
    $mtime2 = filemtime($file2);

    if ($mtime1 > $sortLimit || $mtime2 > $sortLimit)
    {
      return $mtime2 - $mtime1;
    }

    return 2 * mt_rand(0, 1) - 1;
  });

  $samples = [];

  foreach($files as $file)
  {
    //windows ¯\_(ツ)_/¯
    $file = str_replace("\\", "/", $file);

    $pathInfo = pathinfo($file);
    $name = preg_replace("/([^\d])\d{0,2}$/", "\\1", $pathInfo["filename"]);

    //remove first directory from path
    $dirChain = explode("/", $pathInfo["dirname"]);
    unset($dirChain[0]);
    $location = implode("/", $dirChain);
    $file = substr($file, strpos($file, "/") + 1);

    $samples[] = (object)[ "file" => (string)$file , "name" => $name, "id" => hash("crc32", $name), "location" => $location ];
  }

  $samplesJson = json_encode($samples);

  //create random page title
  $boardNames = [
    "music",
    "spam",
    "crack",
    "shit",
    "originality"
  ];

  $postNames  = [
    "amirite",
    "correct",
    "no",
    "you see",
    "eh",
    "hmm"
  ];

  $title = "More like " . $boardNames[mt_rand(0, count($boardNames) - 1)] .
    "board, " . $postNames[mt_rand(0, count($postNames) - 1)]	. "?";
?>
<!-- if this doesn't work you're probably using an inferior browser -->
<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title><?php echo $title ?></title>
    <link rel="stylesheet" href="styles.css" />
    <meta name="viewport" content="initial-scale=1" />
    <link rel="shortcut icon" href="favicon.ico" />
    <script>
      //set samples for the script
      var samples = <?php echo $samplesJson; ?>;
    </script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js" defer></script>
    <script src="index.js" defer /></script>
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
