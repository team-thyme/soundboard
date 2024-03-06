import { useEffect, useMemo, useState } from 'react';

export class TextMeasurer {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

    private readonly widthCache: Map<string, number> = new Map();

    /**
     * @param font - A font specification using the CSS value syntax.
     */
    constructor(font: string) {
        this.canvas = document.createElement('canvas');

        const ctx = this.canvas.getContext('2d');
        if (ctx === null) {
            throw new Error('unable to get canvas context');
        }
        this.ctx = ctx;

        this.setFont(font);
    }

    private setFont(font: string) {
        this.widthCache.clear();
        this.ctx.font = font;
    }

    /**
     * Measures the width of the given text when it's rendered with the font
     * specification passed to the constructor.
     *
     * @param text - The text to measure.
     */
    measureWidth(text: string): number {
        if (this.widthCache.has(text)) {
            return this.widthCache.get(text)!;
        }

        const { width } = this.ctx.measureText(text);
        this.widthCache.set(text, width);
        return width;
    }
}

/**
 * React hook that returns whether the given font is ready to be rendered.
 *
 * @param font - A font specification using the CSS value syntax.
 */
export function useFontReady(font: string): boolean {
    const [fontReady, setFontReady] = useState(() =>
        document.fonts.check(font),
    );
    useEffect(() => {
        document.fonts.load(font).then(() => {
            setFontReady(true);
        });
    }, [font]);
    return fontReady;
}

/**
 * React hook that returns a {@link TextMeasurer} initialized with the given
 * font. Automatically re-initializes the TextMeasurer when the font changes or
 * when the font's ready state changes (see {@link useFontReady}).
 *
 * @param font - A font specification using the CSS value syntax.
 */
export function useTextMeasurer(font: string): TextMeasurer {
    const fontReady = useFontReady(font);
    return useMemo(() => new TextMeasurer(font), [font, fontReady]);
}
