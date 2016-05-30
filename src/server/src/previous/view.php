<!-- If this doesn't work you're probably using an inferior browser. -->
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1" />

  <title><?php echo $title ?></title>

  <link rel="stylesheet" href="build/style.css" />
  <link rel="shortcut icon" href="favicon.ico" />

  <script>
    // Set samples for the script
    window.SAMPLES = <?php echo json_encode($samples) ?>;
  </script>
  <script src="build/script.js" defer></script>
</head>
<body>
  <header class="header">
    <div class="header__search">
      <div class="search">
        <div class="search__placeholder">Cook, Search, Delicious!</div>
        <input class="search__input" type="text" />
      </div>
    </div>
  </header>
  
  <div class="sample-container"></div>
</body>
</html>
