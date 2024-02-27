<?php

namespace TeamThyme\Soundboard\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/**
 * This is a public API: Always add permissive resource sharing headers.
 */
class ApiMiddleware implements MiddlewareInterface
{
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        $response = $handler->handle($request);
        return $response->withHeader('Access-Control-Allow-Origin', '*');
    }
}
