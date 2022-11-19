import { useEffect, useMemo, useState } from 'react';

export default class TextMeasurer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private widthCache: Map<string, number> = new Map();

    constructor(font: string) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.setFont(font);
    }

    private setFont(font: string) {
        this.widthCache = new Map();
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
