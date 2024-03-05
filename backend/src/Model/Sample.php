<?php

namespace TeamThyme\Soundboard\Model;

class Sample implements \JsonSerializable
{
    public readonly string $name;

    /** @var string[] */
    public readonly array $categories;

    public readonly string $id;

    public function __construct(
        public readonly string $file,
        public readonly string $path,
        public readonly int $mtime,
    ) {
        // Conjure a name out of the filename.
        $name = $this->file;
        $slashPosition = strrpos($name, '/');
        if ($slashPosition) {
            $name = substr($name, $slashPosition + 1);
        }

        $dotPosition = strrpos($name, '.');
        if ($dotPosition) {
            $name = substr($name, 0, $dotPosition);
        }

        // Replace trailing numbers, to allow different files to obtain the same name.
        // ^(.+?) lazily match everything with at least one starting character (prevents number only names from being blank)
        // ((?<![\d ])\d+)?$ Don't match digits directly placed next to non-whitespace characters at the end of the string
        $this->name = preg_replace('/^(.+?)((?<![\d ])\d+)?$/', '\1', $name);

        $this->id = hash('crc32', $this->name);

        // Create categories for each of the relative directories.
        $this->categories = array_slice(explode('/', $this->file), 0, -1);
    }

    public function jsonSerialize(): array
    {
        return [
            'path' => $this->path,
            'name' => $this->name,
            'id' => $this->id,
            'mtime' => $this->mtime,
            'categories' => $this->categories,
        ];
    }
}
