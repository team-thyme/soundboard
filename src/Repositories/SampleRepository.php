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

    public function findAll()
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

    public function findByQuery(string $query)
    {
        $samples = $this->findAll();

        $queryTerms = preg_split("/\s/", $query);
        $regexQuery = "/^(?=.*" . implode(")(?=.*", $queryTerms) . ").*$/i";

        $filteredSamples = array_values(array_filter($samples, function($sample) use ($regexQuery) {
            $searchString = $sample->getName() . " " . implode(" ", $sample->getCategories());

            return preg_match($regexQuery, $searchString);
        }));

        return $filteredSamples;
    }
}
