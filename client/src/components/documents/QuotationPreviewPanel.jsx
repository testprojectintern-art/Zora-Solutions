import { useMemo, useState, useEffect, useRef } from 'react'
import { FiPrinter, FiSave, FiSend, FiDownload, FiCheckSquare, FiSquare } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import QuotationPrintBody from './QuotationPrintBody'
import { printHtmlContent } from '../../lib/documentPrint'
import { shareDocumentViaWhatsApp } from '../../lib/documentShare'
import { formatMoney } from '../../lib/currencies'
import {
  layoutPrintExtraCss,
  layoutToStyle,
  quotationLayoutFromSettings,
} from '../../lib/quotationPrintLayout'

const DOC_WIDTH_PX = 794

export default function QuotationPreviewPanel({
  quotation,
  siteSettings = {},
  bankLabel = '',
  onSaveDraft,
  onSend,
  onDownloadPdf,
  saving = false,
  isDraft = false,
  showSeal,
  printRootId = 'quotation-print-export-root',
}) {
  const q = quotation || {}
  const layout = useMemo(() => quotationLayoutFromSettings(siteSettings), [siteSettings])
  const mergedQuotation = q

  // User toggle for signature (defaults to false - only add if user wants it)
  const [includeSignature, setIncludeSignature] = useState(
    showSeal !== undefined ? showSeal : (mergedQuotation.showSeal ?? false)
  )

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
  }, [layout, mergedQuotation, includeSignature])

  const handlePrint = () => {
    const root = document.getElementById(printRootId)
    const inner = root?.innerHTML
    if (!inner) return
    const company = siteSettings.siteName || 'Quotation'
    printHtmlContent({
      title: `${company} - ${q.quotationNo || 'Quotation'}`,
      bodyHtml: `<div class="doc-print-frame">${inner}</div>`,
      extraCss: layoutPrintExtraCss(layout),
    })
  }

  const handleWhatsAppShare = async () => {
    const root = document.getElementById(printRootId)
    const inner = root?.innerHTML
    if (!inner) return

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
          <div style="padding: 12mm;">${inner}</div>
        </body>
      </html>
    `

    await shareDocumentViaWhatsApp({
      htmlString,
      filename: `${q.quotationNo || 'quotation'}.pdf`,
      docType: 'Quotation',
      docNo: q.quotationNo,
      clientName: q.client?.name,
      clientPhone: q.client?.phone,
      amount: formatMoney(q.total || 0, q.currency || 'LKR'),
      date: q.quotationDate ? new Date(q.quotationDate).toLocaleDateString('en-LK') : '',
      validUntil: q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-LK') : '',
      companyName: siteSettings.siteName || 'Zora Solutions',
      companyPhone: siteSettings.contactPhone || '0777498608',
      companyEmail: siteSettings.adminEmail || siteSettings.contactEmail || 'zorasolutions.official@gmail.com',
    })
  }

  return (
    <div className="doc-preview-panel flex flex-col flex-1 min-h-0 h-full overflow-hidden">
      {!isDraft && (
        <div className="no-print shrink-0 border-b bg-slate-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {onSaveDraft && (
              <button type="button" disabled={saving} className="btn-outline btn-sm" onClick={() => onSaveDraft(mergedQuotation)}>
                <FiSave size={14} /> Save
              </button>
            )}
            {onSend && (
              <button type="button" className="btn-outline btn-sm" onClick={() => onSend(mergedQuotation)}>
                <FiSend size={14} /> Email
              </button>
            )}
            {onDownloadPdf && q._id && (
              <button type="button" className="btn-outline btn-sm" onClick={() => onDownloadPdf(q._id, q.quotationNo, includeSignature)}>
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-0 md:p-8 bg-slate-100/80">
        <div style={{ width: DOC_WIDTH_PX * fitScale, height: docHeight > 0 ? docHeight * fitScale : 'auto', margin: '0 auto' }}>
          <div
            id={printRootId}
            ref={docRef}
            className={`quotation-doc doc-print-frame mx-auto bg-white shadow-lg ${layout.showDocumentFrame ? 'border border-slate-200' : ''}`}
            style={{
              ...layoutToStyle(layout),
              width: DOC_WIDTH_PX,
              boxSizing: 'border-box',
              transform: `scale(${fitScale})`,
              transformOrigin: 'top center',
            }}
          >
            <QuotationPrintBody
              quotation={mergedQuotation}
              siteSettings={siteSettings}
              preparedByDisplay={mergedQuotation.preparedBy}
              bankLabel={bankLabel}
              thankYouMessage={siteSettings.quotationThankYouMessage}
              showRefOnDocument={layout.showRefOnDocument}
              includeSignature={includeSignature}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
