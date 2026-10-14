import { htmlStringToPdfBlob } from './pdfGenerator';
import toast from 'react-hot-toast';

/**
 * Clean phone number for WhatsApp international format (e.g. 0777498608 -> 94777498608)
 */
export function formatWhatsAppPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^\d+]/g, '').trim();
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  // Default Sri Lanka prefix if local 10-digit number starting with 0
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '94' + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Format executive message for WhatsApp sharing
 */
export function buildDocumentWhatsAppText({
  docType = 'Document',
  docNo = '',
  clientName = '',
  amount = '',
  date = '',
  validUntil = '',
  dueDate = '',
  companyName = 'Zora Solutions',
  companyPhone = '0777498608',
  companyEmail = 'zorasolutions.official@gmail.com',
  shareUrl = '',
}) {
  const parts = [];
  parts.push(`*${docType.toUpperCase()} FROM ${companyName.toUpperCase()}* 📄`);
  parts.push('━━━━━━━━━━━━━━━━━━━━━━');
  if (docNo) parts.push(`*${docType} No:* ${docNo}`);
  if (clientName) parts.push(`*Client:* ${clientName}`);
  if (amount) parts.push(`*Total Amount:* ${amount}`);
  if (date) parts.push(`*Date:* ${date}`);
  if (validUntil) parts.push(`*Valid Until:* ${validUntil}`);
  if (dueDate) parts.push(`*Due Date:* ${dueDate}`);
  parts.push('━━━━━━━━━━━━━━━━━━━━━━');
  parts.push(`Please find attached your official ${docType}. If you have any inquiries, feel free to reply directly.`);
  if (shareUrl) parts.push(`\n🔗 View Online: ${shareUrl}`);
  parts.push(`\n*${companyName}*\n📞 ${companyPhone}\n✉️ ${companyEmail}`);

  return parts.join('\n');
}

/**
 * Share document PDF directly via WhatsApp:
 * - On iPhone / iOS Safari / Android: Uses Web Share API (navigator.share) with the PDF file attached.
 *   This opens the native iOS Share Sheet directly with WhatsApp ready to send the PDF!
 * - On Desktop / Unsupported browsers: Downloads the PDF to device and opens WhatsApp with pre-filled message.
 */
export async function shareDocumentViaWhatsApp({
  htmlString,
  filename,
  docType = 'Quotation',
  docNo = '',
  clientName = '',
  clientPhone = '',
  amount = '',
  date = '',
  validUntil = '',
  dueDate = '',
  companyName = 'Zora Solutions',
  companyPhone = '0777498608',
  companyEmail = 'zorasolutions.official@gmail.com',
  shareUrl = '',
}) {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const messageText = buildDocumentWhatsAppText({
    docType,
    docNo,
    clientName,
    amount,
    date,
    validUntil,
    dueDate,
    companyName,
    companyPhone,
    companyEmail,
    shareUrl,
  });

  const toastId = toast.loading('Preparing PDF for WhatsApp...');

  try {
    const { blob, pdf } = await htmlStringToPdfBlob(htmlString);
    const pdfFile = new File([blob], safeFilename, { type: 'application/pdf' });

    // 1. Try Native Mobile Web Share (Supported on iOS 15+ Safari, Chrome on Android)
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      toast.dismiss(toastId);
      try {
        await navigator.share({
          files: [pdfFile],
          title: `${docType} ${docNo}`,
          text: messageText,
        });
        toast.success('Shared successfully!');
        return { success: true, method: 'native-share' };
      } catch (err) {
        if (err.name === 'AbortError') {
          // User closed share sheet, no error
          return { success: false, aborted: true };
        }
        console.warn('Native share failed, falling back to download + WhatsApp link:', err);
      }
    }

    // 2. Fallback: Save PDF & open WhatsApp directly
    pdf.save(safeFilename);

    const cleanPhone = formatWhatsAppPhoneNumber(clientPhone);
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

    // Slight delay so download starts first
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 400);

    toast.dismiss(toastId);
    toast.success('PDF downloaded! Opening WhatsApp to attach and send.', { duration: 4000 });
    return { success: true, method: 'download-and-link' };
  } catch (error) {
    console.error('Failed to share PDF via WhatsApp:', error);
    toast.dismiss(toastId);
    toast.error('Could not prepare PDF for sharing. Please try again.');
    return { success: false, error };
  }
}
