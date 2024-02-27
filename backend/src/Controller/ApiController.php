<?php

namespace TeamThyme\Soundboard\Controller;

use Psr\Http\Message\ResponseInterface;

class ApiController
{
    public function __construct()
    {
    }

    public function indexAction(ResponseInterface $response): ResponseInterface
    {
        $body = $response->getBody();
        $body->write(json_encode([
            'isThereASoundboardApihere' => 'yesDefinitely',
            'whatIsItsVersionNumber' => 'iDontKnowIDontWantToCreateASharedConfigForThat',
        ]));

        return $response
            ->withHeader('Content-Type', 'application/json');
    }
}
