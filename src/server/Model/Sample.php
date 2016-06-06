<?php

namespace Villermen\Soundboard\Model;

use \JsonSerializable;

class Sample implements JsonSerializable
{
	// Todo: injection of these variables from config
	private $sampleLocation = '../../samples';

	private $file;

	private $path;
	private $name;

	public function __construct($file)
	{
		$this->file = $file;

		// Windows compatibility
		$pathname = str_replace('\\', '/', $this->file->getPathname());

		// Make path relative
		$this->path = str_replace($this->sampleLocation, '', $pathname);

		// Conjure a name out of the filename
		$this->name = preg_replace(
			'/([^\d])\d{0,2}$/',
			'\1',
			$file->getBasename('.' . $file->getExtension())
		);
	}

	public function jsonSerialize()
	{
		return [
			'file' => $this->path,
			'name' => $this->name,
			'id' => hash('crc32', $this->name),
			'mtime' => $this->file->getMTime()
		];
	}
}
