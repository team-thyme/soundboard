<?php

namespace Villermen\Soundboard;

use Symfony\Component\Yaml\Yaml;
use \Slim\App as SlimApp;

class App extends SlimApp
{
	private $config;
	protected $router;

	const CONFIG_FILE = '../../config/server.yml';

	public function __construct()
	{
		chdir(dirname(__FILE__) . '/..');

		$config = Yaml::parse(file_get_contents(self::CONFIG_FILE));
		$this->config = $config['server'];

		parent::__construct($this->getConfig('slim'));

		$this->router = new Router($this);
	}

	public function run($silent = false)
	{
		parent::run($silent);
	}

	public function getConfig($section = null)
	{
		if (!$section)
		{
			return $this->config;
		}

		return $this->config[$section];
	}
}
