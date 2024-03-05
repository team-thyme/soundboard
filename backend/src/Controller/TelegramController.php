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
        $requestData = $request->getParsedBody() ?? [];

        if (array_key_exists('inline_query', $requestData)) {
            return $this->handleInlineQuery($request, $response);
        }

        if (array_key_exists('message', $requestData)) {
            return $this->handleMessage($request, $response);
        }

        throw new HttpBadRequestException($request);
    }

    public function handleInlineQuery(Request $request, Response $response) : Response
    {
        $inlineQuery = $request->getParsedBody()['inline_query'];

        $responseData = [
            'method' => 'answerInlineQuery',
            'inline_query_id' => $inlineQuery['id'],
            'results' => []
        ];

        $samples = $this->sampleRepository->findByQuery($inlineQuery['query']);

        $count = 0;
        foreach($samples as $sample) {
            $sampleUrl = $this->routeParser->fullUrlFor($request->getUri(), 'samples/get', [
                'file' => $sample->path,
            ]);

            $responseData['results'][] = [
                'type' => 'voice',
                'id' => substr($sampleUrl, -64), // Not sample ID because it needs to be unique.
                'voice_url' => $sampleUrl,
                'title' => $sample->name,
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

    public function handleMessage(Request $request, Response $response) : Response
    {
        $chat = $request->getParsedBody()['message']['chat'];

        // Only respond to private messages
        if ($chat['type'] !== 'private') {
            return $response;
        }

        $response->getBody()->write(json_encode([
            'method' => 'sendMessage',
            'chat_id' => $chat['id'],
            'text' => 'I\'m too shy to talk with you.',
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
