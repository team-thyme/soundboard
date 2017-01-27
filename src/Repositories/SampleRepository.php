<?php

namespace TeamThyme\Soundboard\Repositories;

use TeamThyme\Soundboard\Models\Sample;
use RecursiveIteratorIterator;
use RegexIterator;
use RecursiveDirectoryIterator;
use finfo;

class SampleRepository
{
    protected $sampleBaseDirectory;

    public function __construct(string $sampleBaseDirectory)
    {
        $this->sampleBaseDirectory = $sampleBaseDirectory;
    }

    public function findAll() : array
    {
        // Get files.
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator(
                $this->sampleBaseDirectory,
                RecursiveDirectoryIterator::FOLLOW_SYMLINKS
            )
        );

        // Filter sound files.
        $iterator = new RegexIterator(
            $iterator,
            "/\.(wav|mp3|ogg)$/"
        );

        // Map to sample objects.
        $samples = array_map(function($file) {
            // Windows compatibility.
            $path = str_replace("\\", "/", $file->getPathname());

            // Remove the included "samples/".
            $path = substr($path, 8);

            // Create an url out of path.
            // Urlencode.
            $url = implode("/", array_map(function($part) {
                return rawurlencode($part);
            }, explode("/", $path)));

            return new Sample($path, $url, $file->getMTime());
        }, iterator_to_array($iterator, false));

        return $samples;
    }

    public function findByQuery(string $query) : array
    {
        $samples = $this->findAll();

        // Strip non-alphanumeric characters (will be done in target as well)
        $query = preg_replace("/[^\w\s\|]/", "", $query);
        // Enable OR-searching when whitespace is around the pipe character "|"
        $query = preg_replace("/\s+\|\s+/", "|", $query);
        // Split by any combination of whitespace characters
        $terms = preg_split("/[\s\+&]+/", $query);

        $regex = "/.*(?=.*" . implode(")(?=.*", $terms) . ").*/i";

        $filteredSamples = array_values(array_filter($samples, function($sample) use ($regex) {
            $searchString =
                preg_replace("/[^\w\s\|]/", "", $sample->getName()) .
                " " .
                preg_replace("/[^\w\s\|]/", "", implode(" ", $sample->getCategories()));

            return preg_match($regex, $searchString);
        }));

        return $filteredSamples;
    }
}
