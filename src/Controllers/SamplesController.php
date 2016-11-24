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
        // Construct relative path to sample
        $file = "/" . $arguments["file"];

        // Directory traveral protection.
        $file = str_replace("/../", "/", $file);

        $path = $this->getContainer()->get("config")["soundboard"]["sampleBaseDirectory"] . $file;
        if (!file_exists($path)) {
            throw new NotFoundException($request, $response);
        }

        // Determine content type (Fileinfo is unreliable here, use a good ol" switch to determine content type)
        $extension = pathinfo($path, PATHINFO_EXTENSION);

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
                throw new Exception("Unknown file type requested.");
        }

        $response = $response
            ->withHeader("Content-Type", $contentType)
            ->withHeader("Accept-Ranges", "bytes");
            // ->withHeader("Content-Length", filesize($path));

        // Send file with X-Sendfile header if enabled (It"s worth it)
        if (function_exists("apache_get_modules") && in_array("mod_xsendfile", apache_get_modules())) {
            $response = $response->withHeader("X-Sendfile", $path);
        } else {
            readfile($path);
        }

        return $response;
    }
}
