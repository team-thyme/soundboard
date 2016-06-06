<?php

namespace Villermen\Soundboard\Model;

use \JsonSerializable;

class Sample implements JsonSerializable
{
	protected $file;
	protected $name;
	protected $mtime;

	public function __construct($file, $mtime)
	{
		$this->file = $file;
		$this->mtime = $mtime;

		// Conjure a name out of the filename.
		$name = substr($this->file, strrpos($this->file, '/') + 1);

		$dotPosition = strrpos($name, '.');
		if ($dotPosition) {
			$name = substr($name, 0, $dotPosition);
		}

		// Replace trailing numbers, to allow files to obtain the same name.
		$this->name = preg_replace('/([^\d])\d{0,2}$/', '\1', $name);
	}

	public function jsonSerialize()
	{
		return [
			'file' => $this->file,
			'name' => $this->name,
			'id' => hash('crc32', $this->name),
			'mtime' => $this->mtime
		];
	}
}
