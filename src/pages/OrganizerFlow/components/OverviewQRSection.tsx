import { QRCodeCanvas } from 'qrcode.react'
import { Download, Copy, Check } from 'lucide-react'

interface OverviewQRSectionProps {
  eventUrl: string
  eventName?: string
  copied: boolean
  copyLink: () => void
  downloadQRCode: () => void
  shareWhatsApp: () => void
}

export const OverviewQRSection = ({ eventUrl, copied, copyLink, downloadQRCode, shareWhatsApp }: OverviewQRSectionProps) => {
  return (
    <div className="flex w-full flex-col items-center gap-8 md:flex-row md:items-start">
      <div className="group relative shrink-0">
        <div className="absolute -inset-1 rounded-[var(--radius-lg)] bg-[var(--color-champagne-soft)] blur-xl opacity-80 transition duration-500 group-hover:opacity-100 pointer-events-none" />

        <div className="relative flex items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-white/[0.03] p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-white/20">
          <div id="overview-qr" className="relative overflow-hidden rounded-[var(--radius-md)] bg-white p-5 shadow-sm">
            <QRCodeCanvas value={eventUrl} size={150} level="H" includeMargin={false} />
          </div>
        </div>
        <button
          onClick={downloadQRCode}
          className="btn-secondary mt-4 w-full"
        >
          <Download size={14} />
          <span>Exporter QR Code</span>
        </button>
      </div>

      <div className="w-full flex-1 space-y-5">
        <div className="space-y-3">
          <label className="t-eyebrow">Lien de l'evenement</label>
          <div className="flex w-full items-center gap-2">
            <div className="min-w-0 flex-1 truncate rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white/[0.03] px-4 py-4 font-mono text-[10px] text-white/70 sm:text-[11px]">
              {eventUrl}
            </div>
            <button
              onClick={copyLink}
              className={`btn-secondary shrink-0 ${copied ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]' : ''}`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copied ? 'Copie' : 'Copier'}</span>
              <span className="sm:hidden">{copied ? 'Ok' : 'Lien'}</span>
            </button>
            <button
              onClick={shareWhatsApp}
              className="btn-secondary shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .01 5.403.007 12.039c0 2.12.553 4.189 1.602 6.06L0 24l6.105-1.602a11.834 11.834 0 005.937 1.598h.005c6.637 0 12.042-5.405 12.046-12.041a11.811 11.811 0 00-3.518-8.523z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">WA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
