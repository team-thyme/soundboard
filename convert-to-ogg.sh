#!/usr/bin/env bash

# Converts .mp3 and .wav samples to ogg
find samples \( -iname '*.wav' -o -iname '*.mp3' -o -iname '*.flac' \) -exec sh -c 'ffmpeg -i "$1" -codec:a libopus -ac 1 "${1%.*}.ogg"' find-sh {} \; -exec rm {} \;
