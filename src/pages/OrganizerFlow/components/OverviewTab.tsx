import { Hourglass, Check, ImageIcon, Hash, Zap } from 'lucide-react'
import { OverviewQRSection } from './OverviewQRSection'
import { OverviewSecuritySection } from './OverviewSecuritySection'
import { OverviewCapacitySection } from './OverviewCapacitySection'

export const OverviewTab = ({ 
  timeRemaining, 
  photos, 
  challenges, 
  totalReactions,
  eventUrl,
  eventData,
  copied,
  copyLink,
  downloadQRCode,
  shareWhatsApp,
  enablePasswordToggle,
  handleTogglePasswordFeature,
  pwdLoading,
  handleRevokePassword,
  newPassword,
  setNewPassword,
  handleSetPassword,
  enableAdminsToggle,
  handleToggleAdminsFeature,
  guests,
  stagedAdmins,
  handleToggleStagedAdmin,
  adminLoading,
  handleSaveAdmins,
  currentConfig
}: any) => {
  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Timer Card */}
      <div className="glass rounded-[2rem] p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent">
              {timeRemaining.phase === 'finished' ? <Check size={20} /> : <Hourglass size={20} className="animate-spin" />}
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-accent block">Cycle Événementiel</span>
              <h3 className="text-sm font-bold text-gray-200">{timeRemaining.label}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 pt-4 text-center">
          {[
            { v: timeRemaining.days, l: 'Jours' },
            { v: timeRemaining.hours, l: 'Heures' },
            { v: timeRemaining.minutes, l: 'Min' },
            { v: timeRemaining.seconds, l: 'Sec', color: 'text-accent' }
          ].map((t, i) => (
            <div key={i} className="bg-black/40 border border-white/5 rounded-2xl py-3">
              <span className={`text-2xl font-black ${t.color || 'text-white'}`}>{String(t.v).padStart(2, '0')}</span>
              <span className="text-[8px] font-extrabold uppercase block text-gray-500">{t.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Photos', value: photos.length, icon: ImageIcon, color: 'text-primary' },
          { label: 'Défis', value: challenges.length, icon: Hash, color: 'text-accent' },
          { label: 'Réactions', value: totalReactions, icon: Zap, color: 'text-yellow-400' },
          { label: 'Statut', value: timeRemaining.phase === 'finished' ? 'Clôturé' : 'Actif', icon: Check, color: 'text-green-400' }
        ].map((stat, i) => (
          <div key={i} className="glass p-5 rounded-3xl border border-white/5 space-y-3">
            <div className={`${stat.color} bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center`}><stat.icon size={20} /></div>
            <div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Admin QR, Security & Storage Grid */}
      {eventData && currentConfig && (
        <div className="glass rounded-[2.5rem] p-6 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
            <OverviewQRSection 
              eventUrl={eventUrl} 
              eventName={eventData.name} 
              copied={copied} 
              copyLink={copyLink} 
              downloadQRCode={downloadQRCode} 
              shareWhatsApp={shareWhatsApp} 
            />
            
            <div className="space-y-6 md:border-l md:border-white/5 md:pl-8">
              <OverviewSecuritySection 
                enablePasswordToggle={enablePasswordToggle} 
                handleTogglePasswordFeature={handleTogglePasswordFeature}
                eventData={eventData} 
                pwdLoading={pwdLoading}
                handleRevokePassword={handleRevokePassword}
                newPassword={newPassword} 
                setNewPassword={setNewPassword}
                handleSetPassword={handleSetPassword}
                enableAdminsToggle={enableAdminsToggle}
                handleToggleAdminsFeature={handleToggleAdminsFeature}
                allDisplayGuests={guests} 
                stagedAdmins={stagedAdmins}
                handleToggleStagedAdmin={handleToggleStagedAdmin}
                adminLoading={adminLoading} 
                handleSaveAdmins={handleSaveAdmins}
              />
              <OverviewCapacitySection currentPhotos={photos.length} maxPhotos={currentConfig.max_photos} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
