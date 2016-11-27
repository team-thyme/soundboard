# Soundboard
> More like bitterballen, niet?

## Features
- Add wav/mp3/ogg files to `samples/` to instantly add them to the API
- Searching for specific samples
- Telegram API
- Have multiple samples with the same name by suffixing them with digits
- Contains maximum overkill

Samples not included!

## How to _deal with it?_
1. Download the latest release, or build from source by running `build.sh`
2. Add some wav/mp3/ogg files to `samples/`
3. __Optional:__ Convert the samples to a compatible format with FFmpeg byr running `convert-to-ogg.sh`
4. __Optional:__ Start a development server by executing `devserver.sh`
5. Make sure only to expose the `public/` directory to the public. E.g. by symlinking to it.

## X-Sendfile
Samples are served through PHP by default. This is due to them residing outside of the public directory. This disables certain Apache cleverness like buffering, and will cause other weird side-effects. This can be fixed by serving them with X-Sendfile. To set up X-Sendfile for Apache on Linux, you'll have to install the Apache mod using something similar to `sudo apt-get install libapache2-mod-xsendfile`. The soundboard will automatically start using X-Sendfile, but it will deny access to the samples directory (giving a 404). Allow X-Sendfile to serve the files by adding the samples directory to sendfile's allowed paths. Add something similar to `XSendFilePath /path/to/soundboard/samples` to your Apache's website configuration.

## API
To obtain an array with the info of all the available samples:

```
GET /samples
```

Example output:

```
{
  "samples": [
    {
      "url": "loop/yoshi's%20island.ogg",
      "name": "yoshi's island",
      "id": "3153b81e",
      "mtime": 1465334423,
      "categories": [
        "loop"
      ]
    },
    {
      "url": "loop/de%20huilende%20rappers/boutjes%20moertjes%20stekkertjes snoertjes.ogg",
      "name": "boutjes moertjes stekkertjes snoertjes",
      "id": "e6d4f390",
      "mtime": 1465333910,
      "categories": [
        "loop",
        "de huilende rappers"
      ]
    }.
    {
      "url": "voice/wow%20effect3.ogg",
      "name": "wow effect",
      "id": "68851e0f",
      "mtime": 1465670673,
      "categories": [
        "voice"
      ]
    }
  ]
}
```

You can refine this list by adding a query to the request:

```
GET /samples?query=rappers|wow
```

Example output:

```
{
  "samples": [
    {
      "url": "loop/de%20huilende%20rappers/boutjes%20moertjes%20stekkertjes%20snoertjes.ogg",
      "name": "boutjes moertjes stekkertjes snoertjes",
      "id": "e6d4f390",
      "mtime": 1465333910,
      "categories": [
        "loop",
        "de huilende rappers"
      ]
    }.
    {
      "url": "voice/wow%20effect.ogg",
      "name": "wow effect",
      "id": "68851e0f",
      "mtime": 1465670673,
      "categories": [
        "voice"
      ]
    }
  ]
}
```

Separating query arguments with a space will perform an AND match, and separating them by a pipe will perform an OR match. This behavior mimics the [front-end](https://github.com/team-thyme/soundboard-front-end) as closely as possible (it does not use the API for this, as API calls are expensive).

Actually obtaining the sample data can be done by appending a sample's path to the `samples/` url:

```
GET /samples/voice/wow%20effect.ogg
```

## Telegram API
Setting up a telegram bot with the API is as simple as setting the API's inline url to `[your-back-ends-url]/telegram`.
