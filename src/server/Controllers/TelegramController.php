<?php

namespace Villermen\Soundboard\Controllers;

use Villermen\Soundboard\Controller;
use Villermen\Soundboard\Repositories\SampleRepository;
use Slim\Http\Request;
use Slim\Http\Response;

class TelegramController extends Controller
{
	private $requestData;

	/**
	 * Routes the request.
	 */
	public function webhookAction(Request $request, Response $response)
	{
		$this->requestData = $request->getParsedBody();

		if (isset($this->requestData['inline_query'])) {
			return $this->handleInlineQuery($request, $response);
		} elseif (isset($this->requestData['message'])) {
			return $this->handleMessage($request, $response);
		}
	}

	public function handleInlineQuery(Request $request, Response $response) : Response
	{
		$query = $this->requestData['inline_query']['query'];

		$responseData = [
			'method' => 'answerInlineQuery',
			'inline_query_id' => $this->requestData['inline_query']['id'],
			'results' => []
		];

		$sampleRepository = new SampleRepository($this->getSampleBaseUrl($request));
		$samples = $sampleRepository->findByQuery($query);

		$count = 0;
		foreach($samples as $sample) {
			$responseData['results'][] = [
				'type' => 'voice',
				'id' => substr($sample->getUrl(), -64),
				'voice_url' => $sample->getUrl(),
				'title' => $sample->getName(),
			];

			// Limit to 50 as per specification
			if (++$count == 50) {
				break;
			}
		}

		return $response->withJson($responseData);
	}

	public function handleMessage(Request $request, Response $response) : Response
	{
		$responseData = [
			'method' => 'sendMessage',
			'chat_id' => $this->requestData['message']['chat']['id'],
			'text' => 'I\'m too shy to talk with you.'
		];

		return $response->withJson($responseData);
	}

	/**
	 * Obtains the base url for the samples from the given request.
	 * TODO: Centralize
	 */
	private function getSampleBaseUrl(Request $request) : string
	{
		$requestUri = $request->getUri();

		// Replace the always present /api with /samples for the sample base url.
		$basePath = substr($requestUri->getBasePath(), 0, -4) . '/samples';
		return $requestUri->getScheme() . '://' . $requestUri->getHost() . $basePath;
	}
}
