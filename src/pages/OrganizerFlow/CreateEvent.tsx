import { useNavigate } from 'react-router-dom'
import { Calendar, Sparkles, Zap, Hash, Users, AlertTriangle, LogIn, ArrowRight } from 'lucide-react'
import { useCreateEventLogic } from '../../hooks/useCreateEventLogic'

export default function CreateEvent() {
  const navigate = useNavigate()
  const {
    loading, creationError, isMultiDay, setIsMultiDay,
    activeTab, setActiveTab, joinInput, setJoinInput, joinError,
    formData, setFormData, handleSubmit
  } = useCreateEventLogic()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 selection:bg-white/10 relative overflow-x-hidden font-sans">

      
      <div className="w-full max-w-xl relative z-10 space-y-8 py-10 md:py-16">
        <header className="text-center space-y-4 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full backdrop-blur-xl mb-4">
            <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/40">{activeTab === 'create' ? "Nouveau projet" : "Accès Invité"}</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-serif tracking-tight leading-[1] flex flex-col items-center">
            <span className="text-white/40">{activeTab === 'create' ? 'Capturez' : 'Rejoignez'}</span>
            <span className="text-white">{activeTab === 'create' ? "L'éternité" : 'La Réception'}</span>
          </h1>
        </header>

        <div className="flex bg-white/5 border border-white/10 p-1 rounded-full max-w-sm mx-auto relative z-20">
          <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')} label="Créer" />
          <TabButton active={activeTab === 'join'} onClick={() => setActiveTab('join')} label="Rejoindre" />
        </div>

        <div className="cinematic-surface p-8 md:p-14 space-y-10 relative overflow-hidden group">
          {activeTab === 'create' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(navigate); }} className="space-y-6 relative z-10">
              <InputGroup label="Nom de l'événement" icon={<Hash size={18}/>} placeholder="Ex: Mariage de Sarah & Marc" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
              
              <div className="grid grid-cols-2 gap-4">
                <SelectGroup label="Réception" icon={<Sparkles size={16}/>} value={formData.eventType} onChange={(v: string) => setFormData({...formData, eventType: v})} options={[{v:'mariage', l:'💍 Mariage'}, {v:'anniversaire', l:'🎂 Anniversaire'}, {v:'soiree', l:'🎉 Fête'}]} />
                <SelectGroup label="Capacité" icon={<Users size={16}/>} value={formData.expectedGuests} onChange={(v: string) => setFormData({...formData, expectedGuests: v})} options={[{v:'50', l:'< 50'}, {v:'100', l:'100'}, {v:'300', l:'300'}]} />
              </div>

              <div className="space-y-4">
                  <InputGroup type="datetime-local" label="Date et heure" icon={<Calendar size={18}/>} value={formData.eventDateTime} onChange={(v: string) => setFormData({...formData, eventDateTime: v})} />
                  <label className="flex items-center space-x-4 cursor-pointer group w-fit ml-2">
                    <div onClick={() => setIsMultiDay(!isMultiDay)} className={`w-11 h-6 rounded-full transition-all relative ${isMultiDay ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-black/80 rounded-full transition-all ${isMultiDay ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-white/60">Multi-jours</span>
                  </label>
              </div>

              {creationError && <ErrorMessage message={creationError} />}
              <SubmitButton loading={loading} label="Créer mon album" icon={<Sparkles size={18}/>} />
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); navigate(`/e/${joinInput.toLowerCase()}`) }} className="space-y-8 relative z-10 text-center animate-in fade-in">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-white/60"><LogIn size={28} /></div>
              <h2 className="text-3xl font-serif text-white">Album Privé</h2>
              <InputGroup label="Code Album" icon={<LogIn size={18}/>} placeholder="Ex: lwidj0ck" value={joinInput} onChange={setJoinInput} />
              {joinError && <ErrorMessage message={joinError} />}
              <SubmitButton label="Rejoindre la réception" icon={<ArrowRight size={18}/>} />
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

const TabButton = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`flex-1 py-3 rounded-full text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-500 ${active ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-white/30 hover:text-white/60'}`}>
    <span>{label}</span>
  </button>
)

const InputGroup = ({ label, icon, value, onChange, placeholder, type="text" }: any) => (
  <div className="space-y-4">
    <label className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80 ml-4">{label}</label>
    <div className="relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50">{icon}</div>
      <input 
        type={type} 
        required 
        placeholder={placeholder} 
        style={{ colorScheme: 'dark' }}
        className="w-full bg-white/[0.08] border border-white/10 rounded-2xl pl-14 pr-8 py-6 text-base font-serif outline-none focus:border-white/40 transition-all text-white placeholder:text-white/40" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  </div>
)

const SelectGroup = ({ label, icon, value, onChange, options }: any) => (
  <div className="space-y-4">
    <label className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80 ml-4 block truncate">{label}</label>
    <div className="relative">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50">{icon}</div>
      <select className="w-full bg-white/[0.08] border border-white/10 rounded-2xl pl-12 pr-8 py-5 text-sm font-medium outline-none focus:border-white/40 transition-all appearance-none text-white" value={value} onChange={e => onChange(e.target.value)}>
        {options.map((o: any) => <option key={o.v} value={o.v} className="bg-black text-white">{o.l}</option>)}
      </select>
    </div>
  </div>
)

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start space-x-3 text-red-400 text-xs">
    <AlertTriangle size={18} className="shrink-0" />
    <span className="font-medium leading-relaxed">{message}</span>
  </div>
)

const SubmitButton = ({ loading, label }: any) => (
  <button type="submit" disabled={loading} className="w-full btn-pill btn-primary py-6 text-xs uppercase tracking-[0.4em] flex items-center justify-center disabled:opacity-30">
    {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : label}
  </button>
)

// Removed BackgroundGlows - now handled globally in index.css
