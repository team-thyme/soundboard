# Soundboard
> More like bitterballen, niet?

## Features
- Add wav/mp3/ogg files to `samples/` to instantly add them to the API
- Searching for specific samples
- Telegram API
- Contains maximum overkill

Samples not included!

## How to _deal with it?_
1. Download the latest release, or build from source by running `build.sh`
2. Add some wav/mp3/ogg files to `samples/`
3. __Optional:__ Convert the samples to a compatible format with FFmpeg byr running `convert-to-ogg.sh`
3. __Optional:__ Start a development server by executing `devserver.sh`

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
