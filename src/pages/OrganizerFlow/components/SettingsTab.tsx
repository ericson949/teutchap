import { Shield, Copy, Share2 } from 'lucide-react'

export const SettingsTab = ({ eventData, eventUrl, copyLink, shareWhatsApp, updateEvent }: any) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Share Section */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center space-x-3">
            <Share2 size={24} className="text-primary" />
            <span>Partage & Accès</span>
          </h3>
          <div className="bg-black/40 p-4 rounded-2xl border border-white/5 break-all text-[10px] font-mono text-gray-400">
            {eventUrl}
          </div>
          <div className="flex gap-3">
            <button onClick={copyLink} className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center space-x-2"><Copy size={16} /><span>Copier</span></button>
            <button onClick={shareWhatsApp} className="flex-1 bg-[#25D366] text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center space-x-2"><Share2 size={16} /><span>WhatsApp</span></button>
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
