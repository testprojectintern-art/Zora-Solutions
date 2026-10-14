import { formatMoney } from '../../lib/currencies'
import { buildDocumentLetterheadHtml, authorizedSignatureBlockHtml } from '../../lib/documentPrint'
import { termsLinesFromDoc } from '../../lib/documentTerms'
import DocumentTotalsSection from './DocumentTotalsSection'

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

const PAYMENT_LABELS = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  card: 'Card',
  online: 'Online Payment',
  custom: 'Custom',
}

function bankLabel(inv) {
  const b = inv.bankAccount
  if (!b || typeof b === 'string') return ''
  return `${b.bankName || ''} · ${b.accountNumber || ''}`.trim()
}

export default function InvoicePrintBody({
  invoice,
  siteSettings = {},
  showLetterhead = true,
  showRefOnDocument = true,
  includeSignature = false,
  showSeal,
  forPrint = false,
}) {
  const inv = invoice || {}
  const currency = inv.currency || 'LKR'
  const termsLines = termsLinesFromDoc(inv)
  const bank = bankLabel(inv)

  // Authorized signature resolution
  const roleProfile = siteSettings.signatures?.[inv.directorRole] || null
  const signatoryName = inv.signatures?.authorizer?.name || siteSettings.authorizedSignatoryName || inv.directorName || roleProfile?.label || siteSettings.quotationDirectorName || ''
  const signatoryTitle = inv.signatures?.authorizer?.title || siteSettings.authorizedSignatoryTitle || 'Authorized Signatory'
  const signatureUrl = inv.signatures?.authorizer?.data || siteSettings.authorizedSignatureUrl || roleProfile?.url || ''
  const sealUrl = inv.signatures?.seal?.data || inv.directorSealUrl || siteSettings.sealUrl || ''

  // Only include signature if explicitly requested
  const shouldIncludeSignature = includeSignature !== undefined ? includeSignature : (showSeal ?? false)

  const statusColors = {
    paid: { bg: '#dcfce7', text: '#15803d' },
    partial: { bg: '#fef3c7', text: '#b45309' },
    unpaid: { bg: '#fee2e2', text: '#b91c1c' },
    overdue: { bg: '#fef2f2', text: '#dc2626' },
    draft: { bg: '#f1f5f9', text: '#475569' },
  }
  const statusBadge = statusColors[inv.status] || { bg: '#f1f5f9', text: '#475569' }

  return (
    <div
      className="invoice-doc-inner"
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
      {/* ── Letterhead ── */}
      {showLetterhead && (
        <div className="doc-letterhead-wrap" style={{ marginBottom: '22px', pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>
          <div
            dangerouslySetInnerHTML={{
              __html: buildDocumentLetterheadHtml(siteSettings, {
                forPrint,
                showTagline: siteSettings.letterheadTagline || 'Next Level Tech',
              }),
            }}
          />
        </div>
      )}

      {/* ── Title + Metadata ── */}
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
              TAX INVOICE
            </h2>
            {inv.invoiceNo && (
              <span style={{
                background: CLR.accentLight,
                color: CLR.accent,
                fontWeight: 700,
                fontSize: '9.5pt',
                padding: '3px 9px',
                borderRadius: '6px',
                letterSpacing: '0.03em'
              }}>
                {inv.invoiceNo}
              </span>
            )}
            {inv.status && (
              <span style={{
                background: statusBadge.bg,
                color: statusBadge.text,
                fontWeight: 700,
                fontSize: '8.5pt',
                padding: '3px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {inv.status}
              </span>
            )}
          </div>
          {inv.project?.title && (
            <p style={{ margin: '6px 0 0', color: CLR.mid, fontWeight: 600, fontSize: '11pt', maxWidth: '480px', lineHeight: 1.4 }}>
              Project: {inv.project.title}
            </p>
          )}
        </div>

        <div style={{ textAlign: 'right', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: CLR.muted, textTransform: 'uppercase', fontSize: '8pt', fontWeight: 700, display: 'block', letterSpacing: '0.05em' }}>Invoice Date</span>
            <span style={{ color: CLR.dark, fontWeight: 600, fontSize: '9.5pt' }}>
              {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
            </span>
          </div>
          {inv.dueDate && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: CLR.muted, textTransform: 'uppercase', fontSize: '8pt', fontWeight: 700, display: 'block', letterSpacing: '0.05em' }}>Due Date</span>
              <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: '9.5pt' }}>
                {new Date(inv.dueDate).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Client & Invoice Details ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px', pageBreakInside: 'avoid' }}>
        <div style={{ padding: '14px 18px', background: CLR.bg, borderRadius: '8px', border: `1px solid ${CLR.border}` }}>
          <p style={{ margin: '0 0 6px', fontSize: '8pt', fontWeight: 800, color: CLR.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Billed To
          </p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '11pt', color: CLR.dark }}>{inv.client?.name || 'Valued Client'}</p>
          {inv.client?.companyName && <p style={{ margin: '3px 0 0', fontSize: '9.5pt', color: CLR.mid, fontWeight: 500 }}>{inv.client.companyName}</p>}
          {inv.client?.email && <p style={{ margin: '3px 0 0', fontSize: '9pt', color: CLR.light }}>{inv.client.email}</p>}
          {inv.client?.phone && <p style={{ margin: '3px 0 0', fontSize: '9pt', color: CLR.light }}>{inv.client.phone}</p>}
        </div>

        <div style={{ padding: '14px 18px', background: CLR.bg, borderRadius: '8px', border: `1px solid ${CLR.border}`, textAlign: 'right' }}>
          <p style={{ margin: '0 0 6px', fontSize: '8pt', fontWeight: 800, color: CLR.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Payment &amp; Account Details
          </p>
          {inv.paymentMethod && (
            <p style={{ margin: 0, fontSize: '9pt', color: CLR.mid }}>
              <span style={{ color: CLR.muted }}>Method:</span> {inv.paymentMethod === 'custom' ? inv.paymentMethodCustom : PAYMENT_LABELS[inv.paymentMethod] || inv.paymentMethod}
            </p>
          )}
          {bank && (
            <p style={{ margin: '3px 0 0', fontSize: '9.5pt', fontWeight: 600, color: CLR.dark }}>
              <span style={{ color: CLR.muted, fontWeight: 500 }}>Bank:</span> {bank}
            </p>
          )}
          {(inv.bankBranch || inv.bankAccount?.branchName) && (
            <p style={{ margin: '2px 0 0', fontSize: '9pt', color: CLR.light }}>
              <span style={{ color: CLR.muted }}>Branch:</span> {inv.bankBranch || inv.bankAccount?.branchName}
            </p>
          )}
          {inv.serviceType && (
            <p style={{ margin: '3px 0 0', fontSize: '9pt', color: CLR.light }}>
              <span style={{ color: CLR.muted }}>Service:</span> {inv.serviceType}
            </p>
          )}
        </div>
      </div>

      {/* ── Items Table ── */}
      <table className="doc-table" style={{ width: '100%', borderCollapse: 'collapse', margin: '0 0 20px', fontSize: '9.5pt' }}>
        <thead>
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
          {(inv.items || []).map((item, i) => (
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

      {/* ── Totals Section ── */}
      <DocumentTotalsSection
        doc={inv}
        currency={currency}
        showTransport
        showPaidBalance
      />

      {/* ── Notes ── */}
      {inv.notes && (
        <div style={{ marginTop: '16px', padding: '12px 16px', background: CLR.bg, borderRadius: '8px', border: `1px solid ${CLR.border}`, pageBreakInside: 'avoid' }}>
          <h4 style={{ margin: '0 0 4px', fontSize: '8pt', fontWeight: 700, color: CLR.light, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes / Instructions</h4>
          <p style={{ margin: 0, fontSize: '9pt', lineHeight: 1.5, color: CLR.mid, whiteSpace: 'pre-wrap' }}>{inv.notes}</p>
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
              forPrint,
            }),
          }}
        />
      )}

      {/* ── Terms & Conditions ── */}
      {termsLines.length > 0 && (
        <div style={{ marginTop: '24px', pageBreakInside: 'avoid' }}>
          <div style={{ border: `1px solid ${CLR.border}`, borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '8px 16px', background: CLR.navy }}>
              <h4 style={{ margin: 0, fontSize: '8.5pt', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Terms &amp; Conditions
              </h4>
            </div>
            <div style={{ padding: '12px 16px', background: '#fafbfc' }}>
              <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '8.5pt', lineHeight: 1.65, color: CLR.mid }}>
                {termsLines.map((line, i) => (
                  <li key={i} style={{ paddingLeft: '4px', marginBottom: i < termsLines.length - 1 ? '4px' : 0 }}>{line}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ── Document Footer ── */}
      <div style={{ margin: '22px 0 0', textAlign: 'center', borderTop: `1px solid ${CLR.border}`, paddingTop: '12px' }}>
        <p style={{ margin: 0, color: CLR.light, fontSize: '8.5pt', fontStyle: 'italic', maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto' }}>
          Thank you for choosing {siteSettings.siteName || 'Zora Solutions'}. Next Level Tech.
        </p>
        <p style={{ margin: '4px 0 0', color: CLR.muted, fontSize: '7.5pt' }}>
          This is a computer-generated tax invoice. For queries, contact +94 77 749 8608 or zorasolutions.official@gmail.com.
        </p>
      </div>
    </div>
  )
}
