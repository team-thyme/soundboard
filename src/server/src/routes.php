<?php

namespace Villermen\Soundboard;

use Slim\Http\Request;
use Slim\Http\Response;

$app->get('/samples', function (Request $request, Response $response) {
	$response->withJson([]);
});
