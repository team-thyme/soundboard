<?php

namespace Villermen\Soundboard\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Exception\NotFoundException;
use Villermen\Soundboard\Models\JsonResult;
use Villermen\Soundboard\Models\Sample;
use \RecursiveIteratorIterator;
use \RegexIterator;
use \RecursiveDirectoryIterator;
use \finfo;

class SamplesController
{
	// Todo: injection of these variables from config
	private $sampleLocation = '../../samples';

	public function listAction(Request $request, Response $response)
	{
		$samples = $this->getSamples();

		return $response->withJson($samples);
	}

	public function getAction(Request $request, Response $response, $arguments)
	{
		$file = '/' . $arguments['file'];

		// Directory traveral protection
		$file = str_replace('/../', '/', $file);

		$path = $this->sampleLocation . $file;

		if (!file_exists($path))
		{
			throw new NotFoundException($request, $response);
		}

		$finfo = new finfo();
		$mimeType = $finfo->file($path, FILEINFO_MIME_TYPE);

		readfile($path);

		return $response->withHeader('Content-Type', $mimeType);
	}

	public function getSamples()
	{
		// Get files
		$iterator = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator($this->sampleLocation, RecursiveDirectoryIterator::FOLLOW_SYMLINKS)
		);

		// Filter sound files
		$iterator = new RegexIterator(
			$iterator,
			'/\.(wav|mp3|ogg)$/'
		);

		// Map to sample objects
		$samples = array_map(function($file) {
			return new Sample($file);
		}, iterator_to_array($iterator, false));

		return $samples;
	}
}
