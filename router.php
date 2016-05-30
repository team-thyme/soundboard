<?php

// Allow assets to be passed through, all other requests will be internally redirected to index.php.
if (preg_match('/(?:^\/build|^\/samples|\.ico$)/', $_SERVER['REQUEST_URI'])) {
  return false;
} else {
  include __DIR__ . '/public/index.php';
}
