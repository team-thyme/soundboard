<?php

namespace TeamThyme\Soundboard\Repository;

use DI\Attribute\Inject;
use TeamThyme\Soundboard\Model\Sample;
use RecursiveIteratorIterator;
use RegexIterator;
use RecursiveDirectoryIterator;

class SampleRepository
{
    public function __construct(
        #[Inject('config.soundboard')]
        private readonly array $soundboardConfig,
    ) {
    }

    /**
     * @return Sample[]
     */
    public function findAll(): array
    {
        // Get files.
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator(
                $this->soundboardConfig['sampleBaseDirectory'],
                \FilesystemIterator::FOLLOW_SYMLINKS
            )
        );

        // Filter sound files.
        $iterator = new RegexIterator(
            $iterator,
            '/\.(wav|mp3|ogg|webm)$/'
        );

        // Map to sample objects.
        return array_map(function($file) {
            // Windows compatibility.
            $path = str_replace('\\', '/', $file->getPathname());

            // Remove the included 'samples/'.
            $path = substr($path, 8);

            // Create an url out of path.
            // Urlencode.
            $url = implode('/', array_map(function($part) {
                return rawurlencode($part);
            }, explode('/', $path)));

            return new Sample($path, $url, $file->getMTime());
        }, iterator_to_array($iterator, false));
    }

    /**
     * @return Sample[]
     */
    public function findByQuery(string $query): array
    {
        $samples = $this->findAll();

        // Strip non-alphanumeric characters (will be done in target as well)
        $query = preg_replace('/[^\w\s\|]/', '', $query);
        // Enable OR-searching when whitespace is around the pipe character '|'
        $query = preg_replace('/\s+\|\s+/', '|', $query);
        // Split by any combination of whitespace characters
        $terms = preg_split('/[\s\+&]+/', $query);

        $regex = '/.*(?=.*' . implode(')(?=.*', $terms) . ').*/i';

        return array_values(array_filter($samples, function($sample) use ($regex) {
            $searchString =
                preg_replace('/[^\w\s\|]/', '', $sample->name) .
                ' ' .
                preg_replace('/[^\w\s\|]/', '', implode(' ', $sample->categories));

            return preg_match($regex, $searchString);
        }));
    }
}
