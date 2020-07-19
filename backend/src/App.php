<?php

namespace TeamThyme\Soundboard;

use Slim\App as SlimApp;
use Slim\Http\Request;
use Slim\Http\Response;
use Symfony\Component\Yaml\Yaml;

class App extends SlimApp
{
    const CONFIG_FILE = __DIR__ . '/../config.yml';

    protected $config;

    public function __construct()
    {
        // Set current directory to project root (required for sample discovery)
        chdir(__DIR__ . '/../..');

        // Load configuration.
        $config = Yaml::parse(file_get_contents(self::CONFIG_FILE));
        $this->config = $config['config'];

        // Actually create the app.
        parent::__construct($this->config['slim']);

        // Add configuration and router to container.
        $this->getContainer()['config'] = $this->config;
        $this->getContainer()['router'] = new Router($this->getContainer());

        // Add middleware
        $this->addMiddleware(function(Request $request, Response $response, $next) {
            // This is a public API, always add a permissive resource sharing header
            $response = $response->withHeader('Access-Control-Allow-Origin', '*');

            return $next($request, $response);
        });
    }

    public function run($silent = false)
    {
        parent::run($silent);
    }
}
