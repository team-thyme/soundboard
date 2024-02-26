<?php

namespace TeamThyme\Soundboard\Controller;

use DI\Attribute\Inject;
use Psr\Http\Message\ResponseInterface;

class ApiController
{
    public function __construct(
        #[Inject('config.soundboard')]
        private readonly array $soundboardConfig,
    ) {
    }

    public function indexAction(ResponseInterface $response): ResponseInterface
    {
        $body = $response->getBody();
        $body->write(json_encode([
            'isThereASoundboardApihere' => 'yesDefinitely',
            'whatIsItsVersionNumber' => $this->soundboardConfig['versionNumber'],
        ]));

        return $response
            ->withHeader('Content-Type', 'application/json');
    }
}
