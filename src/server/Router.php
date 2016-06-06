<?php

namespace Villermen\Soundboard;

use Villermen\Soundboard\App;

class Router
{
	protected $app;
	protected $config;
	protected $routes;

	public function __construct(App $app)
	{
		$this->app = $app;
		$this->config = $this->app->getContainer()->get('config')['router'];

		$this->configureRoutes();
	}

	public function configureRoutes()
	{
		foreach ($this->config['routes'] as $name => $route) {
			$controller = new $route['controller']($this->app->getContainer());

			$this->app->map($route['methods'], $route['path'], [ $controller, $route['action'] ]);
		}
	}
}
