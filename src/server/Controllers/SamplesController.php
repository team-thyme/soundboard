<?php

namespace Villermen\Soundboard\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Exception\NotFoundException;
use Villermen\Soundboard\Models\Sample;
use Villermen\Soundboard\Repositories\SampleRepository;
use Villermen\Soundboard\Controller;

class SamplesController extends Controller
{
	public function listAction(Request $request, Response $response, $arguments)
	{
		if ($request->getQueryParam('query')) {
			return $this->queryAction($request, $response, $arguments);
		}

		$sampleRepository = new SampleRepository($this->getSampleBaseUrl($request));
		$samples = $sampleRepository->findAll();

		return $response->withJson((object) [
			'samples' => $samples
		]);
	}

	public function queryAction(Request $request, Response $response, $arguments)
	{
		$query = $request->getQueryParam('query');

		$sampleRepository = new SampleRepository($this->getSampleBaseUrl($request));
		$samples = $sampleRepository->findByQuery($query);

		return $response->withJson((object) [
			'samples' => $samples
		]);
	}

	/**
	 * Obtains the base url for the samples from the given request.
	 */
	private function getSampleBaseUrl(Request $request) : string
	{
		$requestUri = $request->getUri();

		// Replace the always present /api with /samples for the sample base url.
		$basePath = substr($requestUri->getBasePath(), 0, -4) . '/samples';
		return $requestUri->getScheme() . '://' . $requestUri->getHost() . $basePath;
	}
}
