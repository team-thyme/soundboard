<?php

namespace Villermen\Soundboard;

use Villermen\Soundboard\App;

class Router
{
	private $app;
	private $config;
	private $routes;

	public function __construct(App $app)
	{
		$this->app = $app;
		$this->config = $app->getConfig('router');

		$this->configureRoutes();
	}

	public function configureRoutes()
	{
		foreach ($this->config['routes'] as $name => $route) {
			$controller = new $route['controller'];

			//todo: account for methods
			$this->app->map($route['methods'], $route['path'], [ $controller, $route['action'] ]);
		}
	}
}
