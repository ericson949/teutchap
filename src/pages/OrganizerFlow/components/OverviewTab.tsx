import { motion } from "framer-motion";
import {
  Clock3,
  Image as ImageIcon,
  Shield,
  Users,
  Sparkles,
  QrCode,
  Activity,
  Lock,
  HardDrive,
} from "lucide-react";
import { OverviewQRSection } from './OverviewQRSection';
import { OverviewSecuritySection } from './OverviewSecuritySection';
import { OverviewCapacitySection } from './OverviewCapacitySection';

interface OverviewTabProps {
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    phase: string;
    label: string;
  };
  photos: any[];
  challenges: any[];
  totalReactions: number;
  navigate: any;
  eventId: string;
  eventUrl: string;
  eventData: any;
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
  guests: any[];
  stagedAdmins: string[];
  handleToggleStagedAdmin: (pseudo: string) => void;
  adminLoading: boolean;
  handleSaveAdmins: () => Promise<void>;
  currentConfig: any;
}

const MetricCard = ({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent: string;
}) => {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-6 min-h-[140px] group transition-all duration-500"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${accent}, transparent 70%)` }}
      />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 group-hover:text-white group-hover:bg-white/10 transition-all duration-300">
            {icon}
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-semibold">
            Métrique
          </span>
        </div>
        <div className="mt-4">
          <h2 className="text-4xl font-serif text-white tracking-tight">{value}</h2>
          <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/40 font-medium">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const CountdownCell = ({
  value,
  label,
  active,
}: {
  value: number;
  label: string;
  active?: boolean;
}) => (
  <div className={`relative flex flex-col items-center justify-center rounded-[20px] border px-4 py-5 transition-all duration-500 ${active ? "border-white/20 bg-white/[0.05] shadow-[0_0_20px_rgba(255,255,255,0.03)]" : "border-white/[0.05] bg-transparent"}`}>
    <div className={`text-4xl font-serif tracking-tight ${active ? "text-white" : "text-white/80"}`}>
      {String(value).padStart(2, "0")}
    </div>
    <span className="mt-2 text-[9px] uppercase tracking-[0.2em] text-white/40 font-semibold">
      {label}
    </span>
  </div>
);

export function OverviewTab({
  timeRemaining,
  photos,
  challenges,
  totalReactions,
  navigate,
  eventId,
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
}: OverviewTabProps) {
  const isFinished = timeRemaining.phase === 'finished';

  return (
    <div className="relative min-h-screen overflow-x-hidden px-4 pb-40 pt-6 font-sans">
      {/* Premium Cinematic Background FX */}
      <div className="absolute inset-0 bg-[#08060d] -z-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="relative z-10 mb-8 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">
            Tableau de Bord
          </p>
          <h1 className="mt-2 text-4xl font-serif text-white font-medium tracking-tight">
            Vue Organisateur
          </h1>
        </div>
      </div>

      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl p-8 shadow-2xl"
      >
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/[0.03] to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-white/[0.08] p-2 border border-white/[0.05]">
                  <Activity className="h-3.5 w-3.5 text-white/80" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-medium">
                  Statut de l'événement
                </span>
              </div>
              <h2 className="text-3xl font-serif text-white tracking-tight">
                {isFinished ? 'Album scellé' : 'Album en activité'}
              </h2>
              <p className="mt-2 text-sm text-white/50 font-light">
                {timeRemaining.label}
              </p>
            </div>

            <div className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur-md ${isFinished ? 'border-white/10 bg-white/5 text-white/60' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'}`}>
              {isFinished ? 'Terminé' : 'En cours'}
            </div>
          </div>

          {/* COUNTDOWN */}
          {!isFinished && (
            <div className="mt-10 grid grid-cols-4 gap-4 max-w-2xl">
              <CountdownCell value={timeRemaining.days} label="jours" />
              <CountdownCell value={timeRemaining.hours} label="heures" />
              <CountdownCell value={timeRemaining.minutes} label="mins" />
              <CountdownCell value={timeRemaining.seconds} label="sec" active />
            </div>
          )}
        </div>
      </motion.div>

      {/* METRICS */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 grid grid-cols-2 gap-4"
      >
        <MetricCard icon={<ImageIcon size={18} />} value={photos.length} label="photos partagées" accent="#ffffff" />
        <MetricCard icon={<QrCode size={18} />} value={challenges.length} label="défis créés" accent="#ffffff" />
        <MetricCard icon={<Sparkles size={18} />} value={totalReactions} label="réactions" accent="#ffffff" />
        <MetricCard icon={<Shield size={18} />} value={eventData?.access_password ? "Privé" : "Ouvert"} label="confidentialité" accent="#ffffff" />
      </motion.div>

      {/* LOWER GRID */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-3xl"
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

        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-3xl"
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-3xl"
          >
            {currentConfig && (
              <OverviewCapacitySection 
                currentPhotos={photos.length} 
                maxPhotos={currentConfig.max_photos} 
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}