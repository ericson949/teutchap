import { useState } from 'react'
import { Trash2, Loader2, Users, Check, Lock, Eye, EyeOff } from 'lucide-react'
import type { EventData, Guest } from '../../../types'

interface OverviewSecuritySectionProps {
  enablePasswordToggle: boolean;
  handleTogglePasswordFeature: () => void;
  eventData: EventData;
  pwdLoading: boolean;
  handleRevokePassword: () => void;
  newPassword: string;
  setNewPassword: (p: string) => void;
  handleSetPassword: (p: string) => void;
  enableAdminsToggle: boolean;
  handleToggleAdminsFeature: () => void;
  allDisplayGuests: Guest[];
  stagedAdmins: string[];
  handleToggleStagedAdmin: (pseudo: string) => void;
  adminLoading: boolean;
  handleSaveAdmins: () => void;
}

export const OverviewSecuritySection = ({ 
  enablePasswordToggle, handleTogglePasswordFeature, eventData, pwdLoading, 
  handleRevokePassword, newPassword, setNewPassword, handleSetPassword,
  enableAdminsToggle, handleToggleAdminsFeature, allDisplayGuests, stagedAdmins, 
  handleToggleStagedAdmin, adminLoading, handleSaveAdmins
}: OverviewSecuritySectionProps) => {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <div className="space-y-8">
      {/* Password Management */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
          <div className="flex items-center space-x-3">
            <div className="ui-icon ui-icon-warm h-10 w-10 rounded-full">
              <Lock size={16} />
            </div>
            <div>
               <h3 className="text-2xl font-serif tracking-tight text-white leading-none mb-1">Confidentialité</h3>
               <span className="text-[10px] text-white/50 font-medium tracking-[0.15em] uppercase block">Mot de passe de l'album</span>
            </div>
          </div>
          <button
            onClick={handleTogglePasswordFeature}
            className={`w-10 h-5 rounded-full transition-all duration-300 relative border ${enablePasswordToggle ? 'bg-[var(--text-primary)] border-[var(--text-primary)]' : 'bg-transparent border-white/20'}`}
          >
            <div className={`w-3.5 h-3.5 rounded-full transition-transform duration-300 absolute top-0.5 ${enablePasswordToggle ? 'translate-x-5 bg-[var(--text-inverse)]' : 'translate-x-1 bg-white/40'}`} />
          </button>
        </div>

        {enablePasswordToggle && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 pl-4 sm:pl-11">
            {eventData.access_password ? (
              <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-4">
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-white/80 font-mono tracking-[0.2em] truncate">
                    {showPassword ? eventData.access_password : '••••••••'}
                  </span>
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/30 hover:text-white/60 transition-colors p-1.5 hover:bg-white/[0.04] rounded-lg shrink-0"
                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <button 
                  onClick={handleRevokePassword} 
                  disabled={pwdLoading} 
                  className="text-red-400/80 hover:text-red-400 font-bold text-[9px] uppercase tracking-[0.15em] flex items-center space-x-2 transition-colors disabled:opacity-50 shrink-0 ml-4"
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
                  className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.05] rounded-[var(--radius-sm)] px-5 py-4 text-[11px] text-white outline-none focus:border-[var(--border-active)] transition-all font-mono placeholder:text-white/30"
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button 
                  onClick={() => handleSetPassword(newPassword)} 
                  disabled={pwdLoading || !newPassword.trim()} 
                  className="btn-secondary shrink-0 min-w-[100px] disabled:opacity-30"
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
            <div className="ui-icon ui-icon-warm h-10 w-10 rounded-full">
              <Users size={16} />
            </div>
            <div>
               <h3 className="text-2xl font-serif tracking-tight text-white leading-none mb-1">Délégation</h3>
               <span className="text-[10px] text-white/50 font-medium tracking-[0.15em] uppercase block">Gestion des co-admins</span>
               {allDisplayGuests.length === 0 && (
                 <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--color-champagne)]/75">
                   * Nécessite au moins un invité
                 </span>
               )}
            </div>
          </div>
          <button
            onClick={handleToggleAdminsFeature}
            disabled={allDisplayGuests.length === 0}
            className={`w-10 h-5 rounded-full transition-all duration-300 relative border ${enableAdminsToggle ? 'bg-[var(--text-primary)] border-[var(--text-primary)]' : 'bg-transparent border-white/20'} disabled:opacity-30 disabled:cursor-not-allowed`}
            title={allDisplayGuests.length === 0 ? "Vous devez avoir au moins un invité enregistré pour déléguer les droits" : ""}
          >
            <div className={`w-3.5 h-3.5 rounded-full transition-transform duration-300 absolute top-0.5 ${enableAdminsToggle && allDisplayGuests.length > 0 ? 'translate-x-5 bg-[var(--text-inverse)]' : 'translate-x-1 bg-white/40'}`} />
          </button>
        </div>

        {enableAdminsToggle && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 pl-4 sm:pl-11 space-y-4">
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
              {allDisplayGuests.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-[10px] font-medium uppercase tracking-[0.2em] bg-white/[0.01] border border-white/[0.03] rounded-2xl">
                  Aucun invité enregistré
                </div>
              ) : (
                allDisplayGuests.map((g: any, i: number) => {
                  const isSelected = stagedAdmins.includes(g.pseudo)
                  return (
                    <button
                      key={i} 
                      onClick={() => handleToggleStagedAdmin(g.pseudo)}
                      className={`w-full flex items-center justify-between p-4 rounded-[var(--radius-sm)] border text-[11px] font-medium transition-all active:scale-[0.99] ${isSelected ? 'bg-white/[0.06] border-[var(--text-primary)]/35 text-white' : 'bg-white/[0.02] border-white/[0.05] text-white/60 hover:bg-white/[0.04]'}`}
                    >
                      <span className="truncate pr-4 font-mono">{g.pseudo}</span>
                      <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 ${isSelected ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--text-inverse)]' : 'border-white/20'}`}>
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
                className="btn-secondary w-full disabled:opacity-50"
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
