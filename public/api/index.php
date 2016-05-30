<?php

use Slim\App;

define("CODEBASE", __DIR__ . "/../../src/server");

require(CODEBASE . "/vendor/autoload.php");

session_start();

// Instantiate the app
$settings = require CODEBASE . '/src/settings.php';
$app = new App($settings);

// Set up dependencies
require CODEBASE . '/src/dependencies.php';

// Register middleware
require CODEBASE . '/src/middleware.php';

// Register routes
require CODEBASE . '/src/routes.php';

// Run app
$app->run();
