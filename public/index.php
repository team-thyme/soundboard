<?php

use TeamThyme\Soundboard\App;

require(__DIR__ . "/../vendor/autoload.php");

// Fix for builtin PHP server doing something weird when there is a dot (.) in the path
if (PHP_SAPI == "cli-server") {
    $_SERVER["SCRIPT_NAME"] = "/index.php";
}

$app = new App();
$app->run();
