import { Shield, Trash2, Loader2, Users, Check, Lock } from 'lucide-react'

export const OverviewSecuritySection = ({ 
  enablePasswordToggle, handleTogglePasswordFeature, eventData, pwdLoading, 
  handleRevokePassword, newPassword, setNewPassword, handleSetPassword,
  enableAdminsToggle, handleToggleAdminsFeature, allDisplayGuests, stagedAdmins, 
  handleToggleStagedAdmin, adminLoading, handleSaveAdmins
}: any) => {
  return (
    <div className="space-y-8">
      {/* Password Management */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-white/[0.08] p-2 border border-white/[0.05]">
              <Lock size={16} className="text-white/80" />
            </div>
            <div>
               <h3 className="text-2xl font-serif tracking-tight text-white leading-none mb-1">Confidentialité</h3>
               <span className="text-[10px] text-white/50 font-medium tracking-[0.15em] uppercase block">Mot de passe de l'album</span>
            </div>
          </div>
          <button
            onClick={handleTogglePasswordFeature}
            className={`w-10 h-5 rounded-full transition-all duration-300 relative border ${enablePasswordToggle ? 'bg-white border-white' : 'bg-transparent border-white/20'}`}
          >
            <div className={`w-3.5 h-3.5 rounded-full transition-transform duration-300 absolute top-0.5 ${enablePasswordToggle ? 'translate-x-5 bg-black' : 'translate-x-1 bg-white/40'}`} />
          </button>
        </div>

        {enablePasswordToggle && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 pl-11">
            {eventData.access_password ? (
              <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-4">
                <span className="text-white/80 font-mono tracking-[0.3em]">••••••••</span>
                <button 
                  onClick={handleRevokePassword} 
                  disabled={pwdLoading} 
                  className="text-red-400/80 hover:text-red-400 font-bold text-[9px] uppercase tracking-[0.15em] flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {pwdLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  <span>Révoquer</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <input 
                  type="text" 
                  placeholder="Définir un mot de passe..." 
                  className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-4 text-[11px] text-white outline-none focus:border-white/20 transition-all font-mono placeholder:text-white/30"
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button 
                  onClick={() => handleSetPassword(newPassword)} 
                  disabled={pwdLoading || !newPassword.trim()} 
                  className="bg-white text-black hover:bg-white/90 font-bold text-[10px] uppercase tracking-[0.15em] px-6 py-4 rounded-2xl transition-all disabled:opacity-30 shrink-0 flex items-center justify-center min-w-[100px]"
                >
                  {pwdLoading ? <Loader2 size={14} className="animate-spin" /> : 'Activer'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Management */}
      <div className="space-y-5 pt-4">
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-white/[0.08] p-2 border border-white/[0.05]">
              <Users size={16} className="text-white/80" />
            </div>
            <div>
               <h3 className="text-2xl font-serif tracking-tight text-white leading-none mb-1">Délégation</h3>
               <span className="text-[10px] text-white/50 font-medium tracking-[0.15em] uppercase block">Gestion des co-admins</span>
            </div>
          </div>
          <button
            onClick={handleToggleAdminsFeature}
            className={`w-10 h-5 rounded-full transition-all duration-300 relative border ${enableAdminsToggle ? 'bg-white border-white' : 'bg-transparent border-white/20'}`}
          >
            <div className={`w-3.5 h-3.5 rounded-full transition-transform duration-300 absolute top-0.5 ${enableAdminsToggle ? 'translate-x-5 bg-black' : 'translate-x-1 bg-white/40'}`} />
          </button>
        </div>

        {enableAdminsToggle && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 pl-11 space-y-4">
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
              {allDisplayGuests.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-[10px] font-medium uppercase tracking-[0.2em] bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                  Aucun invité enregistré
                </div>
              ) : (
                allDisplayGuests.map((g: any, i: number) => {
                  const isSelected = stagedAdmins.includes(g.pseudo)
                  return (
                    <button
                      key={i} 
                      onClick={() => handleToggleStagedAdmin(g.pseudo)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-[11px] font-medium transition-all ${isSelected ? 'bg-white/[0.08] border-white/20 text-white' : 'bg-white/[0.02] border-white/[0.05] text-white/60 hover:bg-white/[0.04]'}`}
                    >
                      <span className="truncate pr-4 font-mono">{g.pseudo}</span>
                      <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 ${isSelected ? 'border-white bg-white text-black' : 'border-white/20'}`}>
                        {isSelected && <Check size={10} className="stroke-[3]" />}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
            
            {allDisplayGuests.length > 0 && (
              <button 
                onClick={handleSaveAdmins} 
                disabled={adminLoading} 
                className="w-full bg-white hover:bg-white/90 text-black font-bold text-[10px] uppercase tracking-[0.15em] py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center space-x-3"
              >
                {adminLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <span>Appliquer les droits</span>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
