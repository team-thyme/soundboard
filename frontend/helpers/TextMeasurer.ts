export default class TextMeasurer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private widthCache: Map<string, number> = new Map();

    constructor(font: string) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setFont(font);
    }

    setFont(font: string) {
        this.widthCache.clear();
        this.ctx.font = font;
    }

    measureWidth(text: string): number {
        if (this.widthCache.has(text)) {
            return this.widthCache.get(text);
        }

        const { width } = this.ctx.measureText(text);
        this.widthCache.set(text, width);
        return width;
    }
}
