import { Shield, Copy, Share2 } from 'lucide-react'

export const SettingsTab = ({ eventData, eventUrl, copyLink, shareWhatsApp, updateEvent }: any) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Share Section */}
        <div className="glass-dark p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
          
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center space-x-3 relative z-10">
            <Share2 size={24} className="text-primary" />
            <span>Partage & Accès</span>
          </h3>
          
          <div className="bg-black/40 p-5 rounded-2xl border border-white/5 break-all text-[11px] font-mono text-gray-500 shadow-inner relative z-10">
            {eventUrl}
          </div>

          <div className="flex gap-3 relative z-10">
            <button onClick={copyLink} className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/5">
              <Copy size={16} />
              <span>Copier</span>
            </button>
            <button onClick={shareWhatsApp} className="flex-1 bg-[#25D366] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center space-x-2 hover:bg-[#128C7E] transition-all active:scale-95 shadow-lg shadow-[#25D366]/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .01 5.403.007 12.039c0 2.12.553 4.189 1.602 6.06L0 24l6.105-1.602a11.834 11.834 0 005.937 1.598h.005c6.637 0 12.042-5.405 12.046-12.041a11.811 11.811 0 00-3.518-8.523z"/>
              </svg>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center space-x-3">
            <Shield size={24} className="text-accent" />
            <span>Sécurité & IA</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div>
                <p className="text-xs font-black uppercase">Modération IA</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase">Filtrage des contenus inappropriés</p>
              </div>
              <input 
                type="checkbox" 
                checked={eventData.auto_moderation} 
                onChange={(e) => updateEvent({ auto_moderation: e.target.checked })}
                className="w-5 h-5 accent-primary" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
