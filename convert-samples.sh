#!/usr/bin/env bash

cd "${0%/*}"

# Converts .mp3, .ogg and .wav samples to .webm opus.
find samples \( -iname '*.wav' -o -iname '*.mp3' -o -iname '*.flac' -o -iname '*.ogg' \) -exec sh -c 'ffmpeg -i "$1" -map_metadata -1 -codec:a libopus -ac 1 "${1%.*}.webm"' find-sh {} \; -exec rm {} \;
