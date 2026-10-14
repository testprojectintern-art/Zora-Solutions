import { useEffect, useRef, useState } from 'react'
import { FiDownload, FiPrinter, FiSave, FiSend, FiCheckSquare, FiSquare } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import InvoicePrintBody from './InvoicePrintBody'
import { printHtmlContent } from '../../lib/documentPrint'
import { shareDocumentViaWhatsApp } from '../../lib/documentShare'
import { formatMoney } from '../../lib/currencies'
import { resolveDocumentTerms } from '../../lib/documentTerms'
import {
  layoutPrintExtraCss,
  layoutToStyle,
  loadQuotationLayout,
} from '../../lib/quotationPrintLayout'

const DOC_WIDTH_PX = 794

export default function InvoicePreviewPanel({
  invoice,
  siteSettings = {},
  onSaveDraft,
  onSend,
  onDownloadPdf,
  saving = false,
  isDraft = false,
  printRootId = 'invoice-form-preview-root',
}) {
  const inv = invoice || {}
  const [layout] = useState(loadQuotationLayout)
  const [includeSignature, setIncludeSignature] = useState(false)
  const scrollRef = useRef(null)
  const docRef = useRef(null)
  const [fitScale, setFitScale] = useState(1)
  const [docHeight, setDocHeight] = useState(0)

  useEffect(() => {
    if (!scrollRef.current) return
    const ro = new ResizeObserver((entries) => {
      const container = entries[0]
      if (!container) return
      const cw = container.contentRect.width
      if (cw > 0 && cw < DOC_WIDTH_PX) {
        setFitScale(cw / DOC_WIDTH_PX)
      } else {
        setFitScale(1)
      }
    })
    ro.observe(scrollRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!docRef.current) return
    const ro = new ResizeObserver(() => {
      if (docRef.current) {
        setDocHeight(docRef.current.clientHeight)
      }
    })
    ro.observe(docRef.current)
    return () => ro.disconnect()
  }, [layout, includeSignature])

  const [draft, setDraft] = useState({
    notes: inv.notes || '',
    paymentTerms: resolveDocumentTerms(inv),
    showRefOnDocument: true,
  })

  useEffect(() => {
    setDraft({
      notes: inv.notes || '',
      paymentTerms: resolveDocumentTerms(inv),
      showRefOnDocument: !isDraft,
    })
  }, [inv._id])

  useEffect(() => {
    if (!isDraft) return
    setDraft((d) => ({
      ...d,
      notes: inv.notes ?? d.notes,
      paymentTerms: resolveDocumentTerms(inv) || d.paymentTerms,
    }))
  }, [isDraft, inv.notes, inv.paymentTerms, inv.terms])

  const merged = {
    ...inv,
    notes: draft.notes,
    paymentTerms: draft.paymentTerms,
    terms: draft.paymentTerms,
  }

  const handlePrint = () => {
    const el = document.getElementById(printRootId)
    if (!el) return
    const clone = el.cloneNode(true)
    clone.style.transform = ''
    clone.style.width = `${DOC_WIDTH_PX}px`
    printHtmlContent({
      title: `${siteSettings.siteName || 'Invoice'} - ${inv.invoiceNo || ''}`,
      bodyHtml: clone.outerHTML,
      extraCss: layoutPrintExtraCss({ ...layout, showRefOnDocument: draft.showRefOnDocument }),
    })
  }

  const handleWhatsAppShare = async () => {
    const el = document.getElementById(printRootId)
    if (!el) return
    const clone = el.cloneNode(true)
    clone.style.transform = ''
    clone.style.width = `${DOC_WIDTH_PX}px`

    const htmlString = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page { size: A4; margin: 12mm; }
            * { box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 0; background: #fff; }
          </style>
        </head>
        <body>
          <div style="padding: 12mm;">${clone.innerHTML}</div>
        </body>
      </html>
    `

    await shareDocumentViaWhatsApp({
      htmlString,
      filename: `${inv.invoiceNo || 'invoice'}.pdf`,
      docType: 'Invoice',
      docNo: inv.invoiceNo,
      clientName: inv.client?.name,
      clientPhone: inv.client?.phone,
      amount: formatMoney(inv.total || 0, inv.currency || 'LKR'),
      date: inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-LK') : '',
      dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-LK') : '',
      companyName: siteSettings.siteName || 'Zora Solutions',
      companyPhone: siteSettings.contactPhone || '0777498608',
      companyEmail: siteSettings.adminEmail || siteSettings.contactEmail || 'zorasolutions.official@gmail.com',
    })
  }

  return (
    <div className="doc-preview-panel flex flex-col flex-1 min-h-0 min-w-0 h-full overflow-hidden">
      {!isDraft && (
        <div className="no-print shrink-0 border-b bg-slate-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {onSaveDraft && (
              <button type="button" disabled={saving} className="btn-outline btn-sm" onClick={() => onSaveDraft(draft)}>
                <FiSave size={14} /> Save
              </button>
            )}
            {onSend && (
              <button type="button" className="btn-outline btn-sm" onClick={() => onSend(draft)}>
                <FiSend size={14} /> Send
              </button>
            )}
            {onDownloadPdf && inv._id && (
              <button type="button" className="btn-outline btn-sm" onClick={() => onDownloadPdf(inv._id, inv.invoiceNo, includeSignature)}>
                <FiDownload size={14} /> PDF
              </button>
            )}
            <button type="button" className="btn-primary btn-sm" onClick={handlePrint}>
              <FiPrinter size={14} /> Print
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
              onClick={handleWhatsAppShare}
              title="Share PDF directly via WhatsApp (iPhone / Mobile native share supported)"
            >
              <FaWhatsapp size={15} /> WhatsApp
            </button>
          </div>

          {/* Signature inclusion toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs">
            <input
              type="checkbox"
              checked={includeSignature}
              onChange={(e) => setIncludeSignature(e.target.checked)}
              className="sr-only"
            />
            {includeSignature ? <FiCheckSquare className="text-blue-600" size={16} /> : <FiSquare className="text-slate-400" size={16} />}
            <span>Include Authorized Signature</span>
          </label>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-auto p-0 md:p-8 bg-slate-100/80"
      >
        <div style={{ width: DOC_WIDTH_PX * fitScale, height: docHeight > 0 ? docHeight * fitScale : 'auto', margin: '0 auto' }}>
          <div
            id={printRootId}
            ref={docRef}
            className={`invoice-doc doc-print-frame mx-auto bg-white shadow-lg ${layout.showDocumentFrame ? 'border border-slate-200' : ''}`}
            style={{
              ...layoutToStyle(layout),
              width: DOC_WIDTH_PX,
              boxSizing: 'border-box',
              transform: `scale(${fitScale})`,
              transformOrigin: 'top center',
            }}
          >
            <InvoicePrintBody
              invoice={merged}
              siteSettings={siteSettings}
              showRefOnDocument={draft.showRefOnDocument}
              includeSignature={includeSignature}
              forPrint={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
