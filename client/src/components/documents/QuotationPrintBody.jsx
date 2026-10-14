import { formatMoney } from '../../lib/currencies'
import { buildDocumentLetterheadHtml, authorizedSignatureBlockHtml } from '../../lib/documentPrint'
import DocumentTotalsSection from './DocumentTotalsSection'

const PAYMENT_LABELS = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  card: 'Card',
  online: 'Online Payment',
  custom: 'Custom',
}

const FONT = "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
const CLR = {
  dark: '#0f172a',
  navy: '#032d60',
  mid: '#334155',
  light: '#64748b',
  muted: '#94a3b8',
  bg: '#f8fafc',
  border: '#e2e8f0',
  accent: '#0284c7',
  accentLight: '#e0f2fe',
}

const thStyle = {
  background: '#0f172a',
  color: '#ffffff',
  padding: '10px 12px',
  fontSize: '8pt',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontWeight: 700,
  border: 'none',
}
const tdStyle = {
  borderBottom: `1px solid ${CLR.border}`,
  padding: '10px 12px',
  verticalAlign: 'top',
  fontSize: '9.5pt',
}

export default function QuotationPrintBody({
  quotation,
  siteSettings = {},
  preparedByDisplay,
  bankLabel,
  showLetterhead = true,
  thankYouMessage,
  showRefOnDocument = true,
  includeSignature = false,
  showSeal,
  editableNotes,
  editableTerms,
}) {
  const q = quotation || {}
  const currency = q.currency || 'LKR'
  const prepared = preparedByDisplay || q.preparedBy || q.generatedBy?.name || ''
  const thanks = thankYouMessage ?? siteSettings.quotationThankYouMessage ?? 'Thank you for your business! Should you have any questions regarding this quotation, please feel free to contact us.'
  const notes = editableNotes !== undefined ? editableNotes : q.notes
  const terms = editableTerms !== undefined ? editableTerms : q.terms

  // Authorized signature resolution
  const roleProfile = siteSettings.signatures?.[q.directorRole] || null
  const signatoryName = siteSettings.authorizedSignatoryName || q.directorName || roleProfile?.label || siteSettings.quotationDirectorName || ''
  const signatoryTitle = siteSettings.authorizedSignatoryTitle || 'Authorized Signatory'
  const signatureUrl = siteSettings.authorizedSignatureUrl || roleProfile?.url || ''
  const sealUrl = q.directorSealUrl || siteSettings.sealUrl || ''

  // Only include signature if explicitly requested
  const shouldIncludeSignature = includeSignature !== undefined ? includeSignature : (showSeal ?? false)

  const payLabel =
    q.paymentMethod === 'custom'
      ? q.paymentMethodCustom || 'Custom'
      : PAYMENT_LABELS[q.paymentMethod] || q.paymentMethod || ''

  const termsLines = (terms || '').split('\n').map(l => l.trim()).filter(Boolean)

  return (
    <div
      className="quotation-doc-inner"
      style={{
        fontFamily: FONT,
        color: CLR.dark,
        fontSize: '10pt',
        lineHeight: 1.55,
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        background: '#ffffff',
      }}
    >
      {/* ── Letterhead Header ── */}
      {showLetterhead && (
        <div className="doc-letterhead-wrap" style={{ marginBottom: '22px', pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>
          <div
            dangerouslySetInnerHTML={{
              __html: buildDocumentLetterheadHtml(siteSettings, {
                forPrint: false,
              }),
            }}
          />
        </div>
      )}

      {/* ── Document Title & Meta Box ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '22px',
        paddingBottom: '16px',
        borderBottom: `2px solid ${CLR.border}`,
        pageBreakInside: 'avoid'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '22pt', fontWeight: 900, letterSpacing: '0.04em', color: CLR.navy, textTransform: 'uppercase' }}>
              QUOTATION
            </h2>
            {q.quotationNo && (
              <span style={{
                background: CLR.accentLight,
                color: CLR.accent,
                fontWeight: 700,
                fontSize: '9.5pt',
                padding: '3px 9px',
                borderRadius: '6px',
                letterSpacing: '0.03em'
              }}>
                {q.quotationNo}
              </span>
            )}
          </div>
          {q.title && (
            <p style={{ margin: '6px 0 0', color: CLR.mid, fontWeight: 600, fontSize: '11pt', maxWidth: '480px', lineHeight: 1.4 }}>
              {q.title}
            </p>
          )}
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: CLR.muted, textTransform: 'uppercase', fontSize: '8pt', fontWeight: 700, display: 'block', letterSpacing: '0.05em' }}>Quotation Date</span>
            <span style={{ color: CLR.dark, fontWeight: 600, fontSize: '9.5pt' }}>
              {q.quotationDate ? new Date(q.quotationDate).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          {q.validUntil && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: CLR.muted, textTransform: 'uppercase', fontSize: '8pt', fontWeight: 700, display: 'block', letterSpacing: '0.05em' }}>Valid Until</span>
              <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: '9.5pt' }}>
                {new Date(q.validUntil).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Client & Preparation Info Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px', pageBreakInside: 'avoid' }}>
        <div style={{ padding: '14px 18px', background: CLR.bg, borderRadius: '8px', border: `1px solid ${CLR.border}` }}>
          <p style={{ margin: '0 0 6px', fontSize: '8pt', fontWeight: 800, color: CLR.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Quotation Prepared For
          </p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '11pt', color: CLR.dark }}>{q.client?.name || 'Valued Client'}</p>
          {q.client?.companyName && <p style={{ margin: '3px 0 0', fontSize: '9.5pt', color: CLR.mid, fontWeight: 500 }}>{q.client.companyName}</p>}
          {q.client?.email && <p style={{ margin: '3px 0 0', fontSize: '9pt', color: CLR.light }}>{q.client.email}</p>}
          {q.client?.phone && <p style={{ margin: '3px 0 0', fontSize: '9pt', color: CLR.light }}>{q.client.phone}</p>}
        </div>

        <div style={{ padding: '14px 18px', background: CLR.bg, borderRadius: '8px', border: `1px solid ${CLR.border}`, textAlign: 'right' }}>
          <p style={{ margin: '0 0 6px', fontSize: '8pt', fontWeight: 800, color: CLR.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Issuing Details
          </p>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '10.5pt', color: CLR.dark }}>
            Prepared by: <span style={{ fontWeight: 700 }}>{prepared || 'Zora Solutions'}</span>
          </p>
          {q.serviceType && (
            <p style={{ margin: '4px 0 0', fontSize: '9pt', color: CLR.light }}>
              <span style={{ color: CLR.muted }}>Service:</span> {q.serviceType}
            </p>
          )}
          {payLabel && (
            <p style={{ margin: '2px 0 0', fontSize: '9pt', color: CLR.light }}>
              <span style={{ color: CLR.muted }}>Payment Method:</span> {payLabel}
            </p>
          )}
          {bankLabel && (
            <p style={{ margin: '2px 0 0', fontSize: '9pt', color: CLR.light }}>
              <span style={{ color: CLR.muted }}>Bank:</span> {bankLabel}
            </p>
          )}
          {(q.bankBranch || q.bankAccount?.branchName) && (
            <p style={{ margin: '2px 0 0', fontSize: '9pt', color: CLR.light }}>
              <span style={{ color: CLR.muted }}>Branch:</span> {q.bankBranch || q.bankAccount?.branchName}
            </p>
          )}
        </div>
      </div>

      {/* ── Line Items Table ── */}
      <table className="doc-table" style={{ width: '100%', borderCollapse: 'collapse', margin: '0 0 20px', fontSize: '9.5pt' }}>
        <thead style={{ display: 'table-header-group' }}>
          <tr>
            <th style={{ ...thStyle, textAlign: 'center', width: '36px', borderTopLeftRadius: '6px' }}>#</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Item Description</th>
            <th style={{ ...thStyle, textAlign: 'center', width: '60px' }}>Qty</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '110px' }}>Unit Price</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '80px' }}>Disc.</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '120px', borderTopRightRadius: '6px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {(q.items || []).map((item, i) => (
            <tr key={i} style={{ background: i % 2 === 1 ? '#fafbfc' : '#ffffff' }}>
              <td style={{ ...tdStyle, textAlign: 'center', color: CLR.muted, fontWeight: 600 }}>{i + 1}</td>
              <td style={{ ...tdStyle, fontWeight: 500, color: CLR.dark }}>{item.description}</td>
              <td style={{ ...tdStyle, textAlign: 'center', color: CLR.mid }}>{item.quantity}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: CLR.mid }}>{formatMoney(item.unitPrice || 0, currency)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: item.discount > 0 ? '#b91c1c' : CLR.muted }}>
                {item.discount > 0 ? `${item.discount}%` : '—'}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: CLR.dark }}>
                {formatMoney(item.total || 0, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Totals & Commercial Breakdown ── */}
      <DocumentTotalsSection doc={q} currency={currency} showTransport showAdvance />

      {/* ── Commercial Notes ── */}
      {notes && (
        <div style={{ marginTop: '16px', padding: '12px 16px', background: CLR.bg, borderRadius: '8px', border: `1px solid ${CLR.border}`, pageBreakInside: 'avoid' }}>
          <h4 style={{ margin: '0 0 4px', fontSize: '8pt', fontWeight: 700, color: CLR.light, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes / Remarks</h4>
          <p style={{ margin: 0, color: CLR.mid, whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '9pt' }}>{notes}</p>
        </div>
      )}

      {/* ── Official Authorized Signature Block (Conditional) ── */}
      {shouldIncludeSignature && (signatoryName || signatureUrl || sealUrl) && (
        <div
          style={{ marginTop: '24px', pageBreakInside: 'avoid' }}
          dangerouslySetInnerHTML={{
            __html: authorizedSignatureBlockHtml({
              signatoryName,
              signatoryTitle,
              signatureUrl,
              sealUrl,
              forPrint: false,
            }),
          }}
        />
      )}

      {/* ── Terms & Conditions ── */}
      {termsLines.length > 0 && (
        <div style={{ marginTop: '24px', pageBreakInside: 'avoid' }}>
          <div style={{ border: `1px solid ${CLR.border}`, borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: CLR.navy, padding: '8px 16px' }}>
              <h4 style={{ margin: 0, fontSize: '8.5pt', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Terms &amp; Conditions
              </h4>
            </div>
            <div style={{ padding: '12px 16px', background: '#fafbfc' }}>
              <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '8.5pt', lineHeight: 1.65, color: CLR.mid }}>
                {termsLines.map((line, i) => (
                  <li key={i} style={{ paddingLeft: '4px', marginBottom: i < termsLines.length - 1 ? '4px' : 0 }}>
                    {line}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ── Thank You Message & Document Footer ── */}
      {thanks && (
        <div style={{ margin: '22px 0 0', textAlign: 'center', borderTop: `1px solid ${CLR.border}`, paddingTop: '12px' }}>
          <p style={{ margin: 0, color: CLR.light, fontSize: '8.5pt', fontStyle: 'italic', maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto' }}>
            {thanks}
          </p>
          <p style={{ margin: '4px 0 0', color: CLR.muted, fontSize: '7.5pt' }}>
            This is a computer-generated document from {siteSettings.siteName || 'Zora Solutions'}.
          </p>
        </div>
      )}
    </div>
  )
}
