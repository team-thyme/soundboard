<?php
namespace Soundboard;

// Autoload classes
spl_autoload_register(function ($class) {
  if (strncmp($class, __NAMESPACE__, strlen(__NAMESPACE__)) === 0) {
    $file = str_replace('\/', '/', substr($class, strlen(__NAMESPACE__) + 1)) . '.php';
    include($file);
  }
});

// Start the app
$app = new App();
$app->start();
