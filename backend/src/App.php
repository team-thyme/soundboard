<?php

namespace TeamThyme\Soundboard;

use DI\Bridge\Slim\Bridge;
use DI\ContainerBuilder;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Interfaces\RouteCollectorInterface;
use Slim\Interfaces\RouteParserInterface;
use Symfony\Component\Dotenv\Dotenv;
use TeamThyme\Soundboard\Controller\ApiController;
use TeamThyme\Soundboard\Controller\SamplesController;
use TeamThyme\Soundboard\Controller\TelegramController;

class App
{
    private const CONFIG_FILE = 'backend/src/config.php';

    public static function run(): void
    {
        // Set current directory to project root (required for sample discovery)
        chdir(__DIR__ . '/../..');

        $dotenv = new Dotenv();
        $dotenv->bootEnv('.env', 'prod');

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
        $app->setBasePath('/public-api'); // TODO: Obtain from env.
        $container->set(RouteParserInterface::class, $app->getRouteCollector()->getRouteParser());

        // This is a public API, always add a permissive resource sharing header
        $app->addMiddleware(new class implements MiddlewareInterface {
            public function process(
                ServerRequestInterface $request,
                RequestHandlerInterface $handler
            ): ResponseInterface {
                $response = $handler->handle($request);
                return $response->withHeader('Access-Control-Allow-Origin', '*');
            }
        });

        $app->addRoutingMiddleware();
        $app->addErrorMiddleware(displayErrorDetails: $_ENV['APP_DEBUG'], logErrors: false, logErrorDetails: false);

        // TODO: Do something fancy to autoconfigure (how powerful are PHP-DI's attributes?)
        $app->get('/', [ApiController::class, 'indexAction'])->setName('api/index');
        $app->get('/samples', [SamplesController::class, 'listAction'])->setName('samples/list');
        $app->get('/samples/{file:.+}', [SamplesController::class, 'getAction'])->setName('samples/get');
        $app->post('/telegram', [TelegramController::class, 'webhookAction'])->setName('telegram/webhook');

        $app->run();
    }
}


