import { QRCodeCanvas } from 'qrcode.react'
import { Download, Copy, Check, Share2 } from 'lucide-react'

export const OverviewQRSection = ({ eventUrl, eventName, copied, copyLink, downloadQRCode, shareWhatsApp }: any) => {
  return (
    <div className="space-y-8 flex flex-col items-center md:items-start w-full">
      <div className="w-full flex justify-between items-start pb-4 border-b border-white/[0.05]">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="rounded-full bg-white/[0.08] p-2 border border-white/[0.05]">
               <Share2 size={16} className="text-white/80" />
             </div>
             <h3 className="text-2xl font-serif tracking-tight text-white leading-none">Accès & Partage</h3>
          </div>
          <p className="text-[10px] text-white/50 font-medium tracking-[0.15em] uppercase pl-11">Invitez vos participants</p>
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* QR Code */}
        <div className="relative group shrink-0">
          <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 p-5 rounded-[32px] transition-all duration-500 hover:border-white/20 flex items-center justify-center">
            <div id="overview-qr" className="bg-white p-5 rounded-[24px] shadow-sm relative overflow-hidden">
              <QRCodeCanvas value={eventUrl} size={150} level="H" includeMargin={false} />
            </div>
          </div>
          <button 
            onClick={downloadQRCode} 
            className="w-full mt-4 bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 hover:text-white transition-all flex items-center justify-center space-x-2"
          >
            <Download size={14} />
            <span>Exporter QR Code</span>
          </button>
        </div>

        {/* Link & WhatsApp */}
        <div className="w-full space-y-5 flex-1">
          <div className="space-y-3">
            <label className="text-[9px] font-semibold uppercase text-white/50 tracking-[0.2em]">Lien de l'événement</label>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-4 text-[10px] sm:text-[11px] font-mono text-white/70 truncate">
                {eventUrl}
              </div>
              <button 
                onClick={copyLink} 
                className={`shrink-0 px-4 py-4 rounded-2xl font-bold text-[9px] uppercase tracking-[0.15em] flex items-center space-x-2 transition-all ${copied ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span className="hidden sm:inline">{copied ? 'Copié' : 'Copier'}</span>
                <span className="sm:hidden">{copied ? 'Ok' : 'Lien'}</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-white/[0.05]">
            <label className="text-[9px] font-semibold uppercase text-white/50 tracking-[0.2em]">Partage rapide</label>
            <button 
              onClick={shareWhatsApp}
              className="w-full py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white rounded-2xl transition-all font-bold text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .01 5.403.007 12.039c0 2.12.553 4.189 1.602 6.06L0 24l6.105-1.602a11.834 11.834 0 005.937 1.598h.005c6.637 0 12.042-5.405 12.046-12.041a11.811 11.811 0 00-3.518-8.523z"/>
              </svg>
              <span>Envoyer via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
