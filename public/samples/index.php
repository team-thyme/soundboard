<?php

/*
 * This script will pass through the requested file from the samples.
 * The webserver can't be trusted to handle this, as public might be symlinked.
 */

$sampleDir = __DIR__ . '/../../samples';

chdir($sampleDir);

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

	// Send file with X-Sendfile header if enabled (It's worth it)
	if (function_exists('apache_get_modules') && in_array('mod_xsendfile', apache_get_modules())) {
		header('X-Sendfile: ' . $sampleDir . '/' . $requestPath);
	} else {
		readfile($requestPath);
	}
} else {
	header('HTTP/1.0 404 Not Found');
	echo '<h1>Sample not found</h1><p>The requested sample could not be found.</p>';
}
