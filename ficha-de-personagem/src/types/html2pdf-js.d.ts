declare module 'html2pdf.js' {
  interface Html2CanvasOptions {
    backgroundColor?: string | null
    logging?: boolean
    scale?: number
    useCORS?: boolean
  }

  interface JsPdfOptions {
    format?: 'a4' | string | [number, number]
    orientation?: 'portrait' | 'landscape'
    unit?: 'mm' | 'pt' | 'px' | 'cm' | 'in'
  }

  interface PageBreakOptions {
    avoid?: string | string[]
    mode?: string[]
  }

  interface Html2PdfOptions {
    filename?: string
    html2canvas?: Html2CanvasOptions
    image?: {
      quality?: number
      type?: 'jpeg' | 'png' | string
    }
    jsPDF?: JsPdfOptions
    margin?: number | [number, number, number, number]
    pagebreak?: PageBreakOptions
  }

  interface Html2PdfWorker {
    from(source: HTMLElement): Html2PdfWorker
    save(filename?: string): Promise<void>
    set(options: Html2PdfOptions): Html2PdfWorker
  }

  export default function html2pdf(): Html2PdfWorker
}
