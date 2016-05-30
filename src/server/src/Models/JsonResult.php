<?php

namespace Villermen\Soundboard\Models;

use \JsonSerializable;

class JsonResult implements JsonSerializable
{
	private $error;
	private $data;

	public function __construct($data, $error = false)
	{
		$this->error = $error;
		$this->data = $data;
	}

	public function jsonSerialize()
	{
		$result['error'] = ($this->error == true);

		if ($this->error)
		{
			$result['error_message'] = $this->error;
		}

		$result['data'] = $this->data;

		return $result;
	}
}
