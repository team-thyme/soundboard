<?php
namespace Soundboard;

use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RegexIterator;

class App {

  private $samplePath;
  private $sortLimit;
  private $boardNames;
  private $postNames;

  public function __construct() {
    $this->samplePath = str_replace('\\', '/', __DIR__) . '/../../public/samples';
    $this->sortLimit = time() - 14 * 24 * 60 * 60;

    $this->boardNames = [
      'music',
      'spam',
      'crack',
      'shit',
      'originality',
    ];

    $this->postNames  = [
      'amirite',
      'correct',
      'no',
      'you see',
      'eh',
      'hmm',
    ];
  }

  public function start() {
    $this->render([
      'samples' => $this->getSamples(),
      'title' => $this->getPageTitle(),
    ]);
  }

  public function render($variables) {
    extract($variables);
    include(__DIR__ . '/view.php');
  }

  public function getSamples() {
    // Get files
    $iterator = new RecursiveIteratorIterator(
      new RecursiveDirectoryIterator($this->samplePath)
    );

    // Filter sound files
    $iterator = new RegexIterator(
      $iterator,
      '/\.(wav|mp3|ogg)$/'
    );

    // Map to sample objects
    $iterator = new MapIterator($iterator, function ($file) {
      // Make path relative to public directory
      $path = str_replace($this->samplePath . '/', '', str_replace('\\', '/', $file));

      // Fix the sample name
      $name = $file->getBasename('.' . $file->getExtension());
      $name = preg_replace('/([^\d])\d{0,2}$/', '\1', $name);

      return (object) [
        'file' => $path,
        'name' => $name,
        'location' => dirname($path),
        'id' => hash('crc32', $name),
        'mtime' => $file->getMTime(),
      ];
    });

    // Convert to array
    $samples = iterator_to_array($iterator, false);

    // Sort the samples
    usort($samples, function ($sample1, $sample2) {
      if ($sample1->mtime > $this->sortLimit || $sample2->mtime > $this->sortLimit) {
        return $sample2->mtime - $sample1->mtime;
      }

      return 2 * mt_rand(0, 1) - 1;
    });

    return $samples;
  }

  public function getPageTitle() {
    return 'More like ' . $this->boardNames[array_rand($this->boardNames)] . 'board, '
      . $this->postNames[array_rand($this->postNames)] . '?';
  }

}
