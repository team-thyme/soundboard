#!/usr/bin/env bash

cd "${0%/*}"

# Converts .mp3, .webm and .wav samples to .ogg opus.
find samples \( -iname '*.wav' -o -iname '*.mp3' -o -iname '*.flac' -o -iname '*.webm' \) -exec sh -c 'ffmpeg -i "$1" -map_metadata -1 -codec:a libopus -ac 1 "${1%.*}.ogg"' find-sh {} \; -exec rm {} \;
