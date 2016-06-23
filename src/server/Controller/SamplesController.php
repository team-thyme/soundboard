<?php

namespace Villermen\Soundboard\Controller;

use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Exception\NotFoundException;
use Villermen\Soundboard\Model\Sample;
use Villermen\Soundboard\Controller;
use RecursiveIteratorIterator;
use RegexIterator;
use RecursiveDirectoryIterator;
use finfo;

class SamplesController extends Controller
{
	public function listAction(Request $request, Response $response, $arguments)
	{
		if ($request->getQueryParam('query')) {
			return $this->queryAction($request, $response, $arguments);
		}

		$samples = $this->getSamples($request);

		return $response->withJson((object) [
			'samples' => $samples
		]);
	}

	public function queryAction(Request $request, Response $response, $arguments)
	{
		$query = $request->getQueryParam('query');
		$samples = $this->getSamples($request);
		$queryTerms = preg_split('/\s/', $query);
		$regexQuery = '/^(?=.*' . implode(')(?=.*', $queryTerms) . ').*$/i';

		$filteredSamples = array_values(array_filter($samples, function ($sample) use ($regexQuery) {
			$searchString = $sample->getName() . ' ' . implode(' ', $sample->getCategories());

			return preg_match($regexQuery, $searchString);
		}));

		return $response->withJson((object) [
			'samples' => $filteredSamples
		]);
	}

	public function getSamples(Request $request)
	{
		// Get files.
		$iterator = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator(
				'samples',
				RecursiveDirectoryIterator::FOLLOW_SYMLINKS
			)
		);

		// Filter sound files.
		$iterator = new RegexIterator(
			$iterator,
			'/\.(wav|mp3|ogg)$/'
		);

		// Map to sample objects.
		$sampleBaseUrl = $this->getSampleBaseUrl($request);
		$samples = array_map(function ($file) use ($sampleBaseUrl) {
			// Windows compatibility.
			$path = str_replace('\\', '/', $file->getPathname());

			// Remove the included samples/ directory.
			$path = substr($path, 8);

			// Create an url out of path.
			// Urlencode.
			$urlPath = implode('/', array_map(function($part) {
				return rawurlencode($part);
			}, explode('/', $path)));
			$url = $sampleBaseUrl . '/' . $urlPath;
			return new Sample($path, $url, $file->getMTime());
		}, iterator_to_array($iterator, false));

		return $samples;
	}

	/**
	 * Obtains the base url for the samples from the given request.
	 */
	private function getSampleBaseUrl(Request $request)
	{
		$requestUri = $request->getUri();

		// Replace the always present /api with /samples for the sample base url.
		$basePath = substr($requestUri->getBasePath(), 0, -4) . '/samples';
		return $requestUri->getScheme() . '://' . $requestUri->getHost() . $basePath;
	}
}
