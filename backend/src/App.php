<?php

namespace TeamThyme\Soundboard;

use DI\Bridge\Slim\Bridge;
use DI\ContainerBuilder;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Interfaces\RouteParserInterface;
use Symfony\Component\Dotenv\Dotenv;
use TeamThyme\Soundboard\Controller\ApiController;
use TeamThyme\Soundboard\Controller\SamplesController;
use TeamThyme\Soundboard\Controller\TelegramController;
use TeamThyme\Soundboard\Middleware\ApiMiddleware;

class App
{
    private const CONFIG_FILE = 'backend/src/config.php';

    public static function run(): void
    {
        // Set current directory to project root (required for sample discovery)
        chdir(__DIR__ . '/../..');

        $dotenv = new Dotenv();
        $dotenv->bootEnv('.env');

        $containerBuilder = new ContainerBuilder();
        $containerBuilder->useAutowiring(true);
        $containerBuilder->useAttributes(true);
        $containerBuilder->addDefinitions(self::CONFIG_FILE);
        $container = $containerBuilder->build();

        // Add injectable aliases for all config subkeys. After container build so we don't have to import the config
        // file directly
        foreach ($container->get('config') as $subkey => $value) {
            $container->set(sprintf('config.%s', $subkey), $value);
        }

        $app = Bridge::create($container);
        $container->set(RouteParserInterface::class, $app->getRouteCollector()->getRouteParser());

        // Obtain base path from used API URL. If it points to a _different_ backend then this logic won't be needed
        // anyway.
        $baseUrl = $_ENV['API_BASE_URL'] ?? '/';
        $basePath = rtrim(parse_url($baseUrl, PHP_URL_PATH) ?: '', '/');
        $app->setBasePath($basePath);

        $app->addRoutingMiddleware();
        $app->addMiddleware($container->get(ApiMiddleware::class));
        $app->addErrorMiddleware(
            displayErrorDetails: $_ENV['APP_DEBUG'] ?? false,
            logErrors: false,
            logErrorDetails: false,
        );

        $app->get('/', [ApiController::class, 'indexAction'])->setName('api/index');
        $app->get('/samples', [SamplesController::class, 'listAction'])->setName('samples/list');
        $app->get('/samples/{file:.+}', [SamplesController::class, 'getAction'])->setName('samples/get');
        $app->post('/telegram', [TelegramController::class, 'webhookAction'])->setName('telegram/webhook');

        $app->run();
    }
}


