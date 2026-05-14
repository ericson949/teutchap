import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Check } from 'lucide-react'

export const OverviewQRSection = ({ eventUrl, copied, copyLink, downloadQRCode }: any) => {
  return (
    <div className="space-y-4 flex flex-col items-center md:items-start">
      <div className="w-full flex justify-between items-center">
        <div>
          <h3 className="text-sm md:text-base font-black tracking-tight text-white">Code d'Accès Album</h3>
          <p className="text-[8px] text-gray-500 uppercase font-black">Scan universel invité</p>
        </div>
        <button onClick={downloadQRCode} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-gray-300">
          <Download size={10} /> <span>PNG HD</span>
        </button>
      </div>

      <div id="overview-qr" className="bg-white p-4 rounded-3xl shadow-xl">
        <QRCodeSVG value={eventUrl} size={150} level="H" />
      </div>

      <div className="w-full space-y-1">
        <label className="text-[8px] font-black uppercase text-gray-500 pl-1">Lien direct</label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-mono text-gray-400 truncate shadow-inner">
            {eventUrl}
          </div>
          <button 
            onClick={copyLink} 
            className={`px-3 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center space-x-1 ${copied ? 'bg-green-500 text-white' : 'bg-white text-black'}`}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            <span>{copied ? 'Copié' : 'Copier'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
