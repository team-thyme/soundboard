<?php

namespace TeamThyme\Soundboard;

use Psr\Container\ContainerInterface;
use Slim\Router as SlimRouter;

class Router extends SlimRouter
{
    protected $container;
    protected $config;
    protected $routes;

    public function __construct(ContainerInterface $container)
    {
        parent::__construct();

        $this->container = $container;
        $this->config = $this->container->get('config')['router'];

        $this->configureRoutes();
    }

    public function configureRoutes()
    {
        foreach ($this->config['routes'] as $name => $route) {
            $controller = new $route['controller']($this->container);

            $this->map($route['methods'], $route['path'], [ $controller, $route['action'] ]);
        }
    }
}
