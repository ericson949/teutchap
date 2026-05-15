import { QRCodeCanvas } from 'qrcode.react'
import { Download, Copy, Check } from 'lucide-react'

export const OverviewQRSection = ({ eventUrl, eventName, copied, copyLink, downloadQRCode, shareWhatsApp }: any) => {
  return (
    <div className="space-y-8 flex flex-col items-center md:items-start">
      <div className="w-full flex justify-between items-end">
        <div className="space-y-1">
          <h3 className="text-xl font-black tracking-tight text-white leading-none">Code d'Accès</h3>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Partage immédiat</p>
        </div>
        <button 
          onClick={downloadQRCode} 
          className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/10 transition-all flex items-center space-x-2 active:scale-95 group"
        >
          <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
          <span>PNG HD</span>
        </button>
      </div>

      <div className="relative group">
        <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div id="overview-qr" className="relative bg-white p-8 rounded-[3rem] shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
          <QRCodeCanvas value={eventUrl} size={200} level="H" includeMargin={false} />
        </div>
      </div>

      <div className="w-full space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-500 pl-1 tracking-widest">Lien de l'album</label>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-[11px] font-mono text-gray-400 truncate shadow-inner">
              {eventUrl}
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={copyLink} 
                className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 transition-all shadow-lg ${copied ? 'bg-green-500 text-white' : 'bg-white text-black active:scale-95'}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copié' : 'Copier'}</span>
              </button>
              <button 
                onClick={shareWhatsApp}
                className="p-4 bg-[#25D366] text-white rounded-2xl hover:bg-[#128C7E] transition-all active:scale-90 shadow-lg shadow-[#25D366]/20"
                title="Partager sur WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .01 5.403.007 12.039c0 2.12.553 4.189 1.602 6.06L0 24l6.105-1.602a11.834 11.834 0 005.937 1.598h.005c6.637 0 12.042-5.405 12.046-12.041a11.811 11.811 0 00-3.518-8.523z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
