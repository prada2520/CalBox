import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DownloadPdfOptions {
  elementId: string;
  fileName: string;
  title?: string;
}

/**
 * Downloads a DOM element directly as a high-quality PDF file without relying on browser window.print()
 * which can get blocked inside iframes or mobile web views.
 */
export async function downloadElementAsPdf({
  elementId,
  fileName,
}: DownloadPdfOptions): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return false;
  }

  try {
    // 1. Render canvas with high resolution scale
    const canvas = await html2canvas(element, {
      scale: 2, // 2x for sharp print quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // 2. Initialize A4 PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate aspect ratio
    const imgWidth = pdfWidth - 20; // 10mm margins on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // Top margin

    // First page
    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= (pdfHeight - 20);

    // Add extra pages if content overflows A4
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= (pdfHeight - 20);
    }

    // Save and trigger file download
    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to window.print if jsPDF fails
    window.print();
    return false;
  }
}
