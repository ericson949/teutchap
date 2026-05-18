import { Shield, Trash2, Loader2, UserPlus, Check } from 'lucide-react'

export const OverviewSecuritySection = ({ 
  enablePasswordToggle, handleTogglePasswordFeature, eventData, pwdLoading, 
  handleRevokePassword, newPassword, setNewPassword, handleSetPassword,
  enableAdminsToggle, handleToggleAdminsFeature, allDisplayGuests, stagedAdmins, 
  handleToggleStagedAdmin, adminLoading, handleSaveAdmins
}: any) => {
  return (
    <div className="space-y-4">
      {/* Password Management */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield size={14} className="text-primary" />
            <span className="text-xs font-bold text-gray-200">Mot de passe de l'album</span>
          </div>
          <button
            onClick={handleTogglePasswordFeature}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${enablePasswordToggle ? 'bg-primary' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enablePasswordToggle ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>

        {enablePasswordToggle && (
          <div className="space-y-2 pt-1">
            {eventData.access_password ? (
              <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-primary-light">
                <span>••••••••</span>
                <button onClick={handleRevokePassword} disabled={pwdLoading} className="text-red-400 font-bold text-[9px] uppercase tracking-widest flex items-center space-x-1">
                  {pwdLoading ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                  <span>Révoquer</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <input 
                  type="text" placeholder="Code..." 
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50 font-mono"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                />
                <button onClick={() => handleSetPassword(newPassword)} disabled={pwdLoading || !newPassword.trim()} className="bg-primary text-white font-black text-[9px] uppercase px-3 py-2 rounded-xl">
                  {pwdLoading ? <Loader2 size={12} className="animate-spin" /> : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Management */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus size={14} className="text-accent" />
            <span className="text-xs font-bold text-gray-200">Co-Administrateurs</span>
          </div>
          <button
            onClick={handleToggleAdminsFeature}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${enableAdminsToggle ? 'bg-accent' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enableAdminsToggle ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>

        {enableAdminsToggle && (
          <div className="space-y-2 pt-1">
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {allDisplayGuests.map((g: any, i: number) => (
                <button
                  key={i} onClick={() => handleToggleStagedAdmin(g.pseudo)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-[10px] ${stagedAdmins.includes(g.pseudo) ? 'bg-accent/10 border-accent/30 text-white' : 'bg-black/30 border-white/5 text-gray-400'}`}
                >
                  <span className="truncate">{g.pseudo}</span>
                  {stagedAdmins.includes(g.pseudo) && <Check size={8} />}
                </button>
              ))}
            </div>
            <button onClick={handleSaveAdmins} disabled={adminLoading} className="w-full bg-accent text-white font-black text-[9px] uppercase py-2.5 rounded-xl">
              {adminLoading ? <Loader2 size={12} className="animate-spin" /> : 'Appliquer'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
