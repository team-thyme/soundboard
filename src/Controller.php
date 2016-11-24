<?php

namespace Villermen\Soundboard;

use Interop\Container\ContainerInterface;

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
