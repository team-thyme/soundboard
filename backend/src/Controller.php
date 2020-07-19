<?php

namespace TeamThyme\Soundboard;

use Psr\Container\ContainerInterface;

class Controller
{
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function getContainer()
    {
        return $this->container;
    }
}
