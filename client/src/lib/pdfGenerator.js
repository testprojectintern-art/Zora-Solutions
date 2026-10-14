import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { inlineImagesToDataUrls } from './media';

/**
 * Common renderer that transforms an HTML string into a high-res jsPDF instance.
 * Automatically inlines all image assets into base64 Data URLs so images (logo, signatures, seals)
 * never fail or cause CORS errors inside html2canvas.
 */
export async function renderHtmlToPdf(htmlString) {
  const preparedHtml = await inlineImagesToDataUrls(htmlString);

  const container = document.createElement('div');
  // 794px width is exactly 210mm at 96 DPI (A4 width)
  container.style.width = '794px';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.background = '#ffffff';
  container.innerHTML = preparedHtml;
  document.body.appendChild(container);

  try {
    // Wait for DOM to settle
    await new Promise((r) => setTimeout(r, 120));

    // Wait for images to load
    const imgs = container.querySelectorAll('img');
    await Promise.all(
      Array.from(imgs).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    const canvas = await html2canvas(container, {
      scale: 2, // High resolution (crisp text & vector-quality lines)
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // A4 size in mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate total height of the canvas in mm
    const totalImgHeightInMm = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = totalImgHeightInMm;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalImgHeightInMm);
    heightLeft -= pdfHeight;

    // Subsequent pages if content overflows A4 height
    while (heightLeft > 0) {
      position = heightLeft - totalImgHeightInMm;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalImgHeightInMm);
      heightLeft -= pdfHeight;
    }

    return pdf;
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Downloads the generated PDF directly to the user's browser.
 */
export async function htmlStringToPdfDownload(htmlString, filename) {
  const pdf = await renderHtmlToPdf(htmlString);
  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(cleanFilename);
  return cleanFilename;
}

/**
 * Generates and returns a Blob of the PDF, ideal for native Web Share API (e.g. WhatsApp on iOS / Safari / Android).
 */
export async function htmlStringToPdfBlob(htmlString) {
  const pdf = await renderHtmlToPdf(htmlString);
  const blob = pdf.output('blob');
  return { blob, pdf };
}
