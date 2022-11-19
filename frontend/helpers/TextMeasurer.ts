import { useEffect, useMemo, useState } from 'react';

export default class TextMeasurer {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

    private readonly widthCache: Map<string, number> = new Map();

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

    measureWidth(text: string): number {
        if (this.widthCache.has(text)) {
            return this.widthCache.get(text)!;
        }

        const { width } = this.ctx.measureText(text);
        this.widthCache.set(text, width);
        return width;
    }
}

export function useFontReady(font: string): boolean {
    const [fontReady, setFontReady] = useState(() =>
        // @ts-ignore
        document.fonts.check(font),
    );
    useEffect(() => {
        // @ts-ignore
        document.fonts.load(font).then(() => {
            setFontReady(true);
        });
    }, [font]);
    return fontReady;
}

export function useTextMeasurer(font: string): TextMeasurer {
    const fontReady = useFontReady(font);
    return useMemo(() => new TextMeasurer(font), [font, fontReady]);
}
