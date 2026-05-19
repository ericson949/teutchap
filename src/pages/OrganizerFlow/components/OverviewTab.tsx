import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Shield,
  Sparkles,
  QrCode,
} from "lucide-react";
import { OverviewQRSection } from './OverviewQRSection';
import { OverviewSecuritySection } from './OverviewSecuritySection';
import { OverviewCapacitySection } from './OverviewCapacitySection';
import type { Photo, Challenge, EventData, Guest, TimeRemaining } from '../../../types'

interface OverviewTabProps {
  timeRemaining: TimeRemaining;
  photos: Photo[];
  challenges: Challenge[];
  totalReactions: number;
  eventUrl: string;
  eventData: EventData;
  copied: boolean;
  copyLink: () => void;
  downloadQRCode: () => void;
  shareWhatsApp: () => void;
  enablePasswordToggle: boolean;
  handleTogglePasswordFeature: () => void;
  pwdLoading: boolean;
  handleRevokePassword: () => Promise<void>;
  newPassword: string;
  setNewPassword: (p: string) => void;
  handleSetPassword: (p: string) => Promise<void>;
  enableAdminsToggle: boolean;
  handleToggleAdminsFeature: () => void;
  guests: Guest[];
  stagedAdmins: string[];
  handleToggleStagedAdmin: (pseudo: string) => void;
  adminLoading: boolean;
  handleSaveAdmins: () => Promise<void>;
  currentConfig: any;
  onUpgrade: () => void;
}

const MetricCard = ({
  icon,
  value,
  label,
  accentColor,
  glowBg,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accentColor: string;
  glowBg: string;
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-2xl p-6 group flex flex-col justify-between min-h-[150px] sm:min-h-[170px] shadow-lg shadow-black/40 hover:border-white/20 transition-all duration-500"
    >
      {/* Background glow specific to card */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-[40px] opacity-10 group-hover:opacity-30 group-hover:scale-125 transition-all duration-700 pointer-events-none ${glowBg}`} />
      
      <div className="flex justify-between items-start">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] ${accentColor} group-hover:bg-white/10 transition-all duration-300`}>
          {icon}
        </div>
        <span className="text-[8px] uppercase tracking-[0.25em] text-white/20 font-bold group-hover:text-white/40 transition-colors">
          Stats
        </span>
      </div>
      
      <div className="mt-4">
        <h2 className="text-4xl sm:text-5xl font-sans font-black text-white tracking-tight leading-none">
          {value}
        </h2>
        <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-white/40 font-semibold group-hover:text-white/60 transition-colors">
          {label}
        </p>
      </div>
    </motion.div>
  );
};

const CountdownCell = ({
  value,
  label,
}: {
  value: number;
  label: string;
}) => (
  <div className="flex flex-col items-center justify-center py-4 px-2 transition-colors hover:bg-white/[0.01]">
    <div className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white/95">
      {String(value).padStart(2, "0")}
    </div>
    <span className="mt-1 sm:mt-2 text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">
      {label}
    </span>
  </div>
);

export function OverviewTab({
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
  currentConfig,
  onUpgrade
}: OverviewTabProps) {
  const isFinished = timeRemaining.phase === 'finished';

  return (
    <div className="relative min-h-screen overflow-x-hidden px-0 pb-40 pt-0 font-sans">
      
      {/* 
        PREMIUM BACKDROP LAYER 
        Adding real colors and shapes behind elements so backdrop-blur has beautiful colors to frosted-glass.
      */}
      <div className="absolute inset-0 bg-[#08060d] -z-30 pointer-events-none" />
      
      {/* Dynamic blurred colored blobs */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] -z-20 pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[40%] right-[5%] w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] -z-20 pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-blue-600/5 rounded-full blur-[130px] -z-20 pointer-events-none animate-pulse-slow" style={{ animationDelay: '4s' }} />

      {/* ACCESS & SHARE (Priority #1) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 rounded-[32px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-5 sm:p-8 backdrop-blur-3xl shadow-lg"
      >
        <OverviewQRSection 
          eventUrl={eventUrl}
          eventName={eventData?.name || ""}
          copied={copied}
          copyLink={copyLink}
          downloadQRCode={downloadQRCode}
          shareWhatsApp={shareWhatsApp}
        />
      </motion.div>

      {/* SECURITY & CAPACITY GRID */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-5 sm:p-8 backdrop-blur-3xl shadow-lg min-w-0"
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-5 sm:p-8 backdrop-blur-3xl shadow-lg min-w-0"
        >
          {currentConfig && (
            <OverviewCapacitySection 
              currentPhotos={photos.length} 
              maxPhotos={currentConfig.max_photos} 
              currentGuests={guests?.length || 0}
              maxGuests={currentConfig.max_guests}
              onUpgrade={onUpgrade}
            />
          )}
        </motion.div>
      </div>

      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[36px] border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-3xl p-6 sm:p-10 shadow-[0_24px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Decorative inner glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-white/[0.02] to-transparent pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Dynamic status logic (Epuré & Elegant) */}
        {(() => {
          let badgeText = "Planifié";
          let badgeStyle = "border-blue-500/20 bg-blue-500/10 text-blue-300";
          let subtitleLabel = "L'album photo n'a pas encore débuté";
          let pulseColor = "bg-amber-400";
          let showPulse = true;

          if (timeRemaining.phase === 'before_start') {
            badgeText = "Planifié";
            badgeStyle = "border-blue-500/20 bg-blue-500/10 text-blue-300";
            subtitleLabel = "Avant le début de l'événement";
            pulseColor = "bg-blue-400";
            showPulse = true;
          } else if (timeRemaining.phase === 'active') {
            badgeText = "En cours";
            badgeStyle = "border-blue-500/20 bg-blue-500/10 text-blue-300";
            subtitleLabel = "Album actif, photos en direct";
            pulseColor = "bg-blue-400";
            showPulse = true;
          } else if (timeRemaining.phase === 'finished') {
            badgeText = "Terminé";
            badgeStyle = "border-white/10 bg-white/5 text-white/40";
            subtitleLabel = "L'événement est clos, l'album est scellé";
            pulseColor = "bg-white/40";
            showPulse = false;
          }

          return (
            <div className="relative z-10 flex flex-wrap items-center gap-3">
              <div className={`inline-flex items-center space-x-2 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] backdrop-blur-md ${badgeStyle}`}>
                {showPulse && <div className={`w-1 h-1 rounded-full ${pulseColor} animate-pulse`} />}
                <span>{badgeText}</span>
              </div>
              <span className="text-[10px] text-white/20 hidden xs:inline">•</span>
              <span className="text-[10px] text-white/70 font-semibold tracking-wide">
                {subtitleLabel}
              </span>
            </div>
          );
        })()}

        {/* COUNTDOWN */}
        {!isFinished && (
          <div className="mt-8 max-w-sm">
            <div className="relative p-0.5 rounded-[26px] bg-gradient-to-b from-white/10 to-transparent shadow-inner">
              <div className="flex border border-white/[0.05] rounded-[24px] bg-black/40 backdrop-blur-md divide-x divide-white/[0.05] overflow-hidden">
                <div className="flex-1"><CountdownCell value={timeRemaining.days} label="jours" /></div>
                <div className="flex-1"><CountdownCell value={timeRemaining.hours} label="heures" /></div>
                <div className="flex-1"><CountdownCell value={timeRemaining.minutes} label="mins" /></div>
                <div className="flex-1"><CountdownCell value={timeRemaining.seconds} label="sec" /></div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* METRICS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 grid grid-cols-2 gap-4 sm:gap-6"
      >
        <MetricCard 
          icon={<ImageIcon size={20} />} 
          value={photos.length} 
          label="photos partagées" 
          accentColor="text-amber-400"
          glowBg="bg-amber-400"
        />
        <MetricCard 
          icon={<QrCode size={20} />} 
          value={challenges.length} 
          label="défis créés" 
          accentColor="text-cyan-400"
          glowBg="bg-cyan-400"
        />
        <MetricCard 
          icon={<Sparkles size={20} />} 
          value={totalReactions} 
          label="réactions" 
          accentColor="text-blue-400"
          glowBg="bg-blue-400"
        />
        <MetricCard 
          icon={<Shield size={20} />} 
          value={eventData?.access_password ? "Privé" : "Ouvert"} 
          label="confidentialité" 
          accentColor="text-blue-400"
          glowBg="bg-blue-400"
        />
      </motion.div>
    </div>
  );
}