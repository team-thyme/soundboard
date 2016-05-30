<?php

// Router script for PHP's built-in development server

// Resolve to requested file without query part
$requestedFile = $_SERVER['DOCUMENT_ROOT'] . $_SERVER['REQUEST_URI'];

$queryStart = strpos($requestedFile, '?');
if ($queryStart !== false)
{
	$requestedFile = substr($requestedFile, 0, $queryStart);
}

// Serve the requested file if it exists
if (file_exists($requestedFile))
{
	return false;
}

// Serve the soundboard or api depending on request
if (substr($_SERVER['REQUEST_URI'], 0, 4) != '/api')
{
	include('public/index.html');
}
else
{
	include('public/api/index.php');
}
