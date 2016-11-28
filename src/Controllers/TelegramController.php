<?php

namespace TeamThyme\Soundboard\Controllers;

use TeamThyme\Soundboard\Controller;
use TeamThyme\Soundboard\Repositories\SampleRepository;
use Slim\Http\Request;
use Slim\Http\Response;

class TelegramController extends Controller
{
    private $requestData;

    /**
     * Routes the request.
     */
    public function webhookAction(Request $request, Response $response) : Response
    {
        $this->requestData = $request->getParsedBody();

        if (isset($this->requestData["inline_query"])) {
            return $this->handleInlineQuery($request, $response);
        } elseif (isset($this->requestData["message"])) {
            return $this->handleMessage($request, $response);
        }

        return $response;
    }

    public function handleInlineQuery(Request $request, Response $response) : Response
    {
        $query = $this->requestData["inline_query"]["query"];

        $responseData = [
            "method" => "answerInlineQuery",
            "inline_query_id" => $this->requestData["inline_query"]["id"],
            "results" => []
        ];

        $sampleRepository = new SampleRepository(
            $this->getContainer()->get("config")["soundboard"]["sampleBaseDirectory"]
        );
        $samples = $sampleRepository->findByQuery($query);

        $apiBaseUrl = $request->getUri()->getBaseUrl();

        $count = 0;
        foreach($samples as $sample) {
            $sampleUrl =  $apiBaseUrl . "/samples/" . $sample->getPath();

            $responseData["results"][] = [
                "type" => "voice",
                "id" => substr($sampleUrl, -64),
                "voice_url" => $sampleUrl,
                "title" => $sample->getName(),
                // "caption" => implode(" / ", $sample->getCategories())
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
            "method" => "sendMessage",
            "chat_id" => $this->requestData["message"]["chat"]["id"],
            "text" => "I'm too shy to talk with you."
        ];

        return $response->withJson($responseData);
    }
}
