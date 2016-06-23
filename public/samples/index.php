<?php

/*
 * This script will pass through the requested file from the samples.
 * The webserver can't be trusted to handle this, as public might be symlinked.
 */

chdir(__DIR__ . '/../../samples');

$scriptDirectory = dirname($_SERVER['SCRIPT_NAME']);
$requestPath = substr($_SERVER['REQUEST_URI'], strlen($scriptDirectory) + 1);
$requestPath = rawurldecode($requestPath);

// Directory traveral protection.
$requestPath = str_replace('/..', '/', $requestPath);

if (file_exists($requestPath)) {
	// Pass through the obtained file with some additional headers required for functioning
	$finfo = new finfo();
	$mimeType = $finfo->file($requestPath, FILEINFO_MIME_TYPE);
	$size = filesize($requestPath);

	header('Content-Type: ' . $mimeType);
	header('Accept-Ranges: bytes');
	header('Content-Length: ' . $size);

	readfile($requestPath);
} else {
	header('HTTP/1.0 404 Not Found');
	echo '<h1>Sample not found</h1><p>The requested sample could not be found.</p>';
}
