// TODO: Finish these types + create a PR on the ogv.js repository

type OGVVersion = string;

interface OGVCompat {
    supported(component: 'OGVDecoder' | 'OGVPlayer'): boolean;
}

interface OGVLoaderBase {
    base: string | undefined;
}

interface OGVLoaderWeb extends OGVLoaderBase {}

declare class OGVMediaError {
    code: number;
    message: string;
}

declare class OGVJSElement extends HTMLElement {}

interface OGVPlayerOptions {
    base?: string;
    worker?: unknown;
    webGL?: unknown;
    forceWebGL?: unknown;
    stream?: unknown;

    audioContext?: AudioContext;
    audioDestination?: AudioNode;
    audioBackendFactory?: unknown;

    // Experimental pthreads multithreading mode, if built.
    threading?: unknown;
    // Experimental SIMD mode, if built.
    simd?: unknown;

    debug?: boolean;
    debugFilter?: RegExp;
}

declare class OGVPlayer extends OGVJSElement {
    constructor(options: OGVPlayerOptions);

    src: string;
    readonly buffered: TimeRanges;
    readonly seekable: TimeRanges;
    currentTime: number;
    readonly duration: number;
    readonly paused: boolean;
    readonly ended: boolean;
    readonly seeking: boolean;
    muted: boolean;
    poster: string;
    readonly videoWidth: number;
    readonly ogvjsVideoFrameRate: number;
    readonly ogvjsAudioChannels: number;
    readonly ogvjsAudioSampleRate: number;
    width: number;
    height: number;
    autoplay: boolean;
    controls: boolean;
    loop: boolean;
    crossOrigin: string | null;
    readonly currentSrc: string | null;
    readonly defaultMuted: boolean;
    readonly defaultPlaybackRate: number;
    readonly error: OGVMediaError | null;
    preload: string;
    readonly readyState: number;
    readonly networkState: number;
    playbackRate: number;
    readonly played: TimeRanges;
    volume: number;

    load(): void;
    canPlayType(type: string): '' | 'probably' | 'maybe';
    play(): void;
    pause(): void;
    fastSeek(time: number): void;
}

declare module 'ogv' {
    export const OGVCompat: OGVCompat;
    export const OGVVersion: OGVVersion;
    export const OGVLoader: OGVLoaderWeb;
    export { OGVPlayer };
}

declare module 'ogv/dist/ogv-support' {
    export const OGVCompat: OGVCompat;
    export const OGVVersion: OGVVersion;
}

declare module 'ogv/dist/ogv-version' {
    export const OGVVersion: OGVVersion;
}
