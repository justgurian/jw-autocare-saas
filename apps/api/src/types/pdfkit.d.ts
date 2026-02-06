declare module 'pdfkit' {
  import { Readable } from 'stream';

  interface PDFDocumentOptions {
    size?: string | [number, number];
    margin?: number;
    margins?: { top: number; bottom: number; left: number; right: number };
    layout?: 'portrait' | 'landscape';
  }

  class PDFDocument extends Readable {
    constructor(options?: PDFDocumentOptions);
    pipe<T extends NodeJS.WritableStream>(destination: T): T;
    fontSize(size: number): this;
    font(name: string): this;
    text(text: string, options?: Record<string, unknown>): this;
    text(text: string, x?: number, y?: number, options?: Record<string, unknown>): this;
    moveDown(lines?: number): this;
    end(): void;
  }

  export default PDFDocument;
}
