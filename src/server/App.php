<?php

namespace Villermen\Soundboard;

use Symfony\Component\Yaml\Yaml;
use \Slim\App as SlimApp;

class App extends SlimApp
{
	const CONFIG_FILE = 'config/server.yml';

	public function __construct()
	{
		// Load configuration.
		$config = Yaml::parse(file_get_contents(self::CONFIG_FILE));
		$config = $config['server'];

		// Actually create the app.
		parent::__construct($config['slim']);

		// Add configuration to container.
		$this->getContainer()['config'] = $config;

		$this->router = new Router($this);
	}

	public function run($silent = false)
	{
		parent::run($silent);
	}
}
