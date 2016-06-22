<?php

// Router script for PHP's built-in development server

// Resolve to requested file without query part
$requestedFile = $_SERVER['DOCUMENT_ROOT'] . $_SERVER['REQUEST_URI'];

$queryStart = strpos($requestedFile, '?');
if ($queryStart !== false) {
	$requestedFile = substr($requestedFile, 0, $queryStart);
}

// Serve the requested file if it exists
if (file_exists($requestedFile)) {
	return false;
}

// Serve the soundboard or api depending on request
$urlParts = explode('/', rawurldecode($_SERVER['REQUEST_URI']));
if (isset($urlParts[1])) {
	$firstSlug = $urlParts[1];
	$leftOverUrl = implode('/', array_slice($urlParts, 2));
} else {
	$firstSlug = null;
}

switch ($firstSlug) {
	// Serve the request form the API
	case 'api':
		// Slim relies on SCRIPT_NAME to be set up correctly, and PHP's built-in server doesn't do this right, so fix it
		$_SERVER['SCRIPT_NAME'] = '/api/index.php';
		include('public/api/index.php');
		break;

	// Serve a file from the samples (replaces the .htaccess file in /public/samples)
	case 'samples':
		$adjustedFilename = 'samples/' . $leftOverUrl;

		if (file_exists($adjustedFilename)) {
			$finfo = new finfo();
			$mimeType = $finfo->file($adjustedFilename, FILEINFO_MIME_TYPE);

			header('Content-Type: ' . $mimeType);
			header('Accept-Ranges: bytes');

			readfile($adjustedFilename);
		} else {
			header('HTTP/1.0 404 Not Found');
			echo '<h1>File not found</h1>';
		}
		break;

	// Serve the default index
	default:
		include('public/index.html');
}
