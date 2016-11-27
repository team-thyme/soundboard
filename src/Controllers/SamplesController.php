<?php

namespace TeamThyme\Soundboard\Controllers;

use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Exception\NotFoundException;
use TeamThyme\Soundboard\Models\Sample;
use TeamThyme\Soundboard\Repositories\SampleRepository;
use TeamThyme\Soundboard\Controller;

class SamplesController extends Controller
{
    public function listAction(Request $request, Response $response, $arguments)
    {
        if ($request->getQueryParam("query")) {
            return $this->queryAction($request, $response, $arguments);
        }

        $sampleRepository = new SampleRepository(
            $this->getContainer()->get("config")["soundboard"]["sampleBaseDirectory"]
        );
        $samples = $sampleRepository->findAll();

        return $response->withJson((object) [
            "samples" => $samples
        ]);
    }

    public function queryAction(Request $request, Response $response, $arguments)
    {
        $query = $request->getQueryParam("query");

        $sampleRepository = new SampleRepository(
            $this->getContainer()->get("config")["soundboard"]["sampleBaseDirectory"]
        );
        $samples = $sampleRepository->findByQuery($query);

        return $response->withJson((object) [
            "samples" => $samples
        ]);
    }

    public function getAction(Request $request, Response $response, $arguments)
    {
        // Convert given path to an absolute path to the sample file
        $basePath = realpath($this->getContainer()->get("config")["soundboard"]["sampleBaseDirectory"]);

        if ($basePath === false) {
            throw new Exception("sampleBaseDirectory config option does not point to an existing path.");
        }

        $samplePath = realpath($basePath . "/" . $arguments["file"]);

        // Check if file exist and prevent directory traversal.
        if (!$samplePath || substr($samplePath, 0, strlen($basePath)) != $basePath) {
            throw new NotFoundException($request, $response);
        }

        // Determine content type (Fileinfo is unreliable here, use a good ol' switch to determine content type)
        $extension = pathinfo($samplePath, PATHINFO_EXTENSION);

        switch($extension) {
            case "ogg";
                $contentType = "audio/ogg";
                break;

            case "mp3":
                $contentType = "audio/mpeg";
                break;

            case "wav":
                $contentType = "audio/wav";
                break;

            default:
                throw new NotFoundException($request, $response);
        }

        $response = $response
            ->withHeader("Content-Type", $contentType)
            ->withHeader("Accept-Ranges", "bytes");

        // Send file with X-Sendfile header if enabled (It's worth it)
        if (function_exists("apache_get_modules") && in_array("mod_xsendfile", apache_get_modules())) {
            $response = $response->withHeader("X-Sendfile", $samplePath);
        } else {
            // The best practice would be to read the file to string and use $response->withBody(), but that would be horribly memory inefficient
            readfile($samplePath);
        }

        return $response;
    }
}
