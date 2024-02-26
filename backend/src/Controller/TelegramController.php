<?php

namespace TeamThyme\Soundboard\Controller;

use Slim\Exception\HttpBadRequestException;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use Slim\Routing\RouteParser;
use TeamThyme\Soundboard\Repository\SampleRepository;

class TelegramController
{
    public function __construct(
        private readonly SampleRepository $sampleRepository,
        private readonly RouteParser $routeParser,
    ) {
    }

    public function webhookAction(Request $request, Response $response) : Response
    {
        $requestData = $request->getParsedBody();

        if (isset($this->requestData['inline_query'])) {
            return $this->handleInlineQuery($requestData, $response);
        }

        if (isset($this->requestData['message'])) {
            return $this->handleMessage($requestData, $response);
        }

        throw new HttpBadRequestException($request);
    }

    public function handleInlineQuery(array $requestData, Response $response) : Response
    {
        $query = $requestData['inline_query']['query'];

        $responseData = [
            'method' => 'answerInlineQuery',
            'inline_query_id' => $requestData['inline_query']['id'],
            'results' => []
        ];

        $samples = $this->sampleRepository->findByQuery($query);

        $apiBaseUrl = // TODO: $this->routeParser->urlFor('')

        $count = 0;
        foreach($samples as $sample) {
            $sampleUrl =  $apiBaseUrl . '/samples/' . $sample->getPath();

            $responseData['results'][] = [
                'type' => 'voice',
                'id' => substr($sampleUrl, -64),
                'voice_url' => $sampleUrl,
                'title' => $sample->getName(),
                // 'caption' => implode(' / ', $sample->getCategories()),
            ];

            // Limit to 50 as per specification
            if (++$count >= 50) {
                break;
            }
        }

        $response->getBody()->write(json_encode($responseData));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function handleMessage(array $requestData, Response $response) : Response
    {
        // Only respond to private messages
        if ($requestData['message']['chat']['type'] !== 'private') {
            return $response;
        }

        $response->getBody()->write(json_encode([
            'method' => 'sendMessage',
            'chat_id' => $requestData['message']['chat']['id'],
            'text' => 'I\'m too shy to talk with you.',
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
