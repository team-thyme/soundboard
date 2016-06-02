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
	// Slim relies on SCRIPT_NAME to be set up correctly, and PHP's built-in server doesn't do this right, so fix it
	$_SERVER['SCRIPT_NAME'] = '/api/index.php';
	include('public/api/index.php');
}
