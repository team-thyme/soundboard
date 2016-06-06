<?php

namespace Villermen\Soundboard\Controller;

use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Exception\NotFoundException;
use Villermen\Soundboard\Model\Sample;
use Villermen\Soundboard\Controller;
use \RecursiveIteratorIterator;
use \RegexIterator;
use \RecursiveDirectoryIterator;
use \finfo;

class SamplesController extends Controller
{
	public function listAction(Request $request, Response $response)
	{
		$samples = $this->getSamples();

		return $response->withJson($samples);
	}

	public function getAction(Request $request, Response $response, $arguments)
	{
		$file = '/' . $arguments['file'];

		// Directory traveral protection.
		$file = str_replace('/../', '/', $file);

		$path = $this->getContainer()->get('config')['sampleLocation'] . $file;

		if (!file_exists($path)) {
			throw new NotFoundException($request, $response);
		}

		$finfo = new finfo();
		$mimeType = $finfo->file($path, FILEINFO_MIME_TYPE);

		readfile($path);

		return $response->withHeader('Content-Type', $mimeType);
	}

	public function getSamples()
	{
		// Get files.
		$iterator = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator(
				$this->getContainer()->get('config')['sampleLocation'],
				RecursiveDirectoryIterator::FOLLOW_SYMLINKS
			)
		);

		// Filter sound files.
		$iterator = new RegexIterator(
			$iterator,
			'/\.(wav|mp3|ogg)$/'
		);

		// Map to sample objects.
		$samples = array_map(function ($file) {
			// Windows compatibility.
			$pathname = str_replace('\\', '/', $file->getPathname());

			// Make path relative.
			$path = str_replace($this->getContainer()->get('config')['sampleLocation'], '', $pathname);
			return new Sample($path, $file->getMTime());
		}, iterator_to_array($iterator, false));

		return $samples;
	}
}
