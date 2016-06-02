<?php

namespace Villermen\Soundboard\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;
use Villermen\Soundboard\Models\JsonResult;
use Villermen\Soundboard\Models\Sample;
use \RecursiveIteratorIterator;
use \RegexIterator;
use \RecursiveDirectoryIterator;

class SamplesController
{
	// Todo: injection of these variables from config
	private $sampleLocation = '../../public/samples';
	private $publicSampleLocation = 'samples';

	public function listAction(Request $request, Response $response)
	{
		$samples = $this->getSamples();

		$response->withJson($samples);
	}

	public function getSamples()
	{
		// Get files
    $iterator = new RecursiveIteratorIterator(
      new RecursiveDirectoryIterator($this->sampleLocation)
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
