<?php

namespace Villermen\Soundboard;

use Symfony\Component\Yaml\Yaml;
use \Slim\App as SlimApp;
use Villermen\Soundboard\Router;

class App extends SlimApp
{
	const CONFIG_FILE = 'config/server.yml';

	protected $config;

	public function __construct()
	{
		chdir(__DIR__ . '/../..');

		// Load configuration.
		$config = Yaml::parse(file_get_contents(self::CONFIG_FILE));
		$this->config = $config['server'];

		// Actually create the app.
		parent::__construct($this->config['slim']);

		// Add configuration and router to container.
		$this->getContainer()['config'] = $this->config;
		$this->getContainer()['router'] = new Router($this->getContainer());
	}

	public function run($silent = false)
	{
		parent::run($silent);
	}
}
