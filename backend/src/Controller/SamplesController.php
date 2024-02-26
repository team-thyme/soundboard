<?php

namespace TeamThyme\Soundboard\Controller;

use DI\Attribute\Inject;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpNotFoundException;
use Slim\Interfaces\RouteParserInterface;
use Slim\Psr7\Request;
use Slim\Psr7\Stream;
use TeamThyme\Soundboard\Repository\SampleRepository;

class SamplesController
{
    public function __construct(
        #[Inject('config.soundboard')]
        private readonly array $soundboardConfig,
        private readonly SampleRepository $sampleRepository,
        private readonly RouteParserInterface $routeParser,
    ) {
    }

    public function listAction(Request $request, ResponseInterface $response): ResponseInterface
    {
        dd($this->routeParser->urlFor('telegram/webhook'));

        $query = ($request->getQueryParams()['query'] ?? null);

        $samples = $query ? $this->sampleRepository->findByQuery($query) : $this->sampleRepository->findAll();

        $response->getBody()->write(
            json_encode(
                (object)[
                    'samples' => $samples,
                ]
            )
        );
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getAction(Request $request, ResponseInterface $response, string $file): ResponseInterface
    {
        // Convert given path to an absolute path to the sample file
        $basePath = realpath($this->soundboardConfig['sampleBaseDirectory']);
        if ($basePath === false) {
            throw new \LogicException('sampleBaseDirectory config option does not point to an existing path.');
        }

        $samplePath = realpath($basePath . '/' . $file);

        // Check if file exist and prevent directory traversal.
        if (!$samplePath || !str_starts_with($samplePath, $basePath)) {
            throw new HttpNotFoundException($request);
        }

        // Determine content type (Fileinfo is unreliable here, use a good ol' switch to determine content type)
        $extension = pathinfo($samplePath, PATHINFO_EXTENSION);

        $contentType = match ($extension) {
            'ogg' => 'audio/ogg',
            'mp3' => 'audio/mpeg',
            'wav' => 'audio/wav',
            'webm' => 'audio/webm',
            default => throw new HttpNotFoundException($request),
        };

        $response = $response
            ->withHeader('Content-Type', $contentType)
            ->withHeader('Accept-Ranges', 'bytes');

        // Send file with X-Sendfile header if enabled (It's worth it)
        if (function_exists('apache_get_modules') && in_array('mod_xsendfile', apache_get_modules())) {
            return $response->withHeader('X-Sendfile', $samplePath);
        }

        // The best practice would be to read the file to string and use $response->withBody(), but that would be horribly memory inefficient
        return $response->withBody(new Stream(fopen($samplePath, 'r')));
    }
}
