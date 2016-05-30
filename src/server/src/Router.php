<?php

namespace Villermen\Soundboard;

use Villermen\Soundboard\App;

class Router
{
	private $app;
	private $config;

	public function __construct(App $app)
	{
		$this->app = $app;
		$this->config = $app->getConfig("router");
	}
}
