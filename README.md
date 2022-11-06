# Soundboard
> More like knäckebröd, har jag rätt?

## Features
- Responsive search.
- Direct linking to samples without giving a clue on what's about to play.
- Backend that can be used separately and includes a Telegram API.
- Contains maximum overkill.

See https://viller.men/soundboard for _the_ example. Samples not included!

## Contrails
- <kbd>Enter</kbd> while focused on the search bar to play a random visible sample.
- Hold <kbd>Shift</kbd> to play samples simultaneously.
- Hold <kbd>Ctrl</kbd> to play samples on a loop.
- Press <kbd>Space</kbd> while not focused on the search bar to stop all playing samples.
- <kbd>Right click</kbd> on a sample for all options, like copying the direct link.

## Requirements
- [Node.js](https://nodejs.org/) with [NPM](https://www.npmjs.com/) for building the frontend.
- [PHP](https://www.php.net/) with [Composer](https://getcomposer.org/) for the backend.
- [Apache HTTP Server](https://www.apache.org/) is recommended for hosting the files as `.htaccess` files are provided.

## Browser support
The soundboard's frontend works in _true_ browsers. This means that at least recent versions of Chrome and Firefox are
fully supported. Other browsers give mixed results, but who uses those anyway?

## How to _deal with it?_
1. Download the [latest release](https://github.com/team-thyme/soundboard/releases) or clone the current sources.
2. Build the application using `./build.sh production`.
3. Make the `public/` and `public-api/` directories publicly accessible (E.g., by symlinking them from your web root).
4. Add some webm/ogg/mp3/wav samples to the `samples/` directory.

You can adjust behavior of the soundboard by adjusting the environment variables. Copy `.env.dist` to `.env` and modify
as desired. Point to the right API base URL by adjusting `API_BASE_URL`. When hosting the frontend from a subdirectory
you will have to change the `BASE_URL` variable.

Optional steps:

- Sample files can be served more efficiently using the Apache2 mod X-Sendfile. Install it using something like
  `sudo apt install libapache2-mod-xsendfile` and allow it to serve the samples by adding something similar to
  `XSendFilePath /path/to/soundboard/samples` to your Apache website configuration.
- Convert added samples to an efficient format by running `./convert-samples.sh` (requires FFmpeg).
- Add webm/ogg/mp3/wav files to `samples/` to instantly add them to the API.
- Have multiple samples with the same name by suffixing them with digits (they are stripped from the names).

## Development
We've got you covered fam! Running `./build.sh` will install the project and set you up with a local PHP and JS server
that will automatically rebuild the frontend.

### API methods
The API is hosted on `http://localhost:32658` by default. All calls listed here should be prefixed with this base URL.

<details>
  <summary>/samples - Obtain an array with the info of all the available samples.</summary>

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
</details>

<details>
  <summary>/samples?query=[query] - Search in samples.</summary>

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

  Separating query arguments with a space will perform an AND match, and separating them by a pipe will perform an OR
  match. This behavior mimics the frontend which does not use the API for this. API calls are time, and time is money.
</details>

<details>
  <summary>/samples/[file.ogg] - Obtain sample data.</summary>

  ```
  GET /samples/voice/wow%20effect.ogg
  ```
</details>

### Telegram bot
Setting up a Telegram bot for your own soundboard is as simple as setting the bot's inline url to
`[your-api-base-url]/telegram`.
