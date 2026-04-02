import { DISCLAIMER } from '../utils/disclaimer'
import type { Brief } from '../types/brief'

/**
 * Exports a brief as PDF using jsPDF with html2canvas for the preview element.
 * Falls back to window.print() if html2canvas fails.
 */
export async function exportBriefPdf(brief: Brief, previewElementId: string): Promise<void> {
  // Dynamic import — jsPDF and html2canvas are large, only load when needed
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])

  const element = document.getElementById(previewElementId)
  if (!element) throw new Error('Preview element not found')

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const imgWidth = 190 // mm, leaving 10mm margins on each side
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  const pageHeight = 277 // A4 content height in mm

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const footerText = `${DISCLAIMER} | Prepared: ${new Date().toLocaleDateString()}`
  const pageWidth = pdf.internal.pageSize.getWidth()

  let heightLeft = imgHeight
  let position = 10 // top margin

  // Add image across multiple pages if needed
  const imgData = canvas.toDataURL('image/png')
  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  // Add disclaimer footer to every page
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(6)
    pdf.setTextColor(120, 120, 120)
    const lines = pdf.splitTextToSize(footerText, pageWidth - 20)
    pdf.text(lines, 10, pdf.internal.pageSize.getHeight() - 8)
  }

  const filename = `${brief.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'brief'}_${new Date().toISOString().slice(0, 10)}.pdf`
  pdf.save(filename)
}
