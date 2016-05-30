<?php

namespace Villermen\Soundboard;

use Symfony\Component\Yaml\Yaml;

class App extends \Slim\App
{
	private $config;
	private $router;

	public function __construct($configFile = "config/config.yaml")
	{
		chdir(dirname(__FILE__) . "/..");

		$this->config = Yaml::parse(file_get_contents($configFile));

		parent::__construct($this->config["slim"]);

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
