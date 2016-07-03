#!/usr/bin/env bash

# Converts .mp3 and .wav samples to ogg
find samples \( -iname '*.wav' -o -iname '*.mp3' \) -exec sh -c 'ffmpeg -i "$1" -qscale:a 6 -codec:a libvorbis "${1%.*}.ogg"' find-sh {} \; -exec rm {} \;
