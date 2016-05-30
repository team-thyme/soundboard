<?php

namespace Villermen\Soundboard;

use Symfony\Component\Yaml\Yaml;

class App
{
	private $slim;
	private $config;
	private $router;

	public function __construct($configFile = "config/config.yaml")
	{
		chdir(dirname(__FILE__) . "/..");

		$this->config = Yaml::parse(file_get_contents($configFile));
		
		$this->slim = new \Slim\App($this->config["slim"]);
	}

	public function run()
	{
		$this->slim->run();
	}
}
