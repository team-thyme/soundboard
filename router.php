<?php

// Allow files with certain extensions to pass through, all other requests will be internally
// redirected to index.php.
if (preg_match('/\.(?:wav|mp3|ogg|js|css|ico|eot|svg|ttf|woff|woff2)(?:\?.+)?$/', $_SERVER['REQUEST_URI'])) {
  return false;
} else {
  include __DIR__ . '/public/index.php';
}
