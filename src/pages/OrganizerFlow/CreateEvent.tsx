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
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col items-center p-4 selection:bg-primary/30 relative overflow-x-hidden">
      <BackgroundGlows />
      
      <div className="w-full max-w-xl relative z-10 space-y-8 py-10 md:py-16">
        <header className="text-center space-y-4 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full backdrop-blur-xl">
            <Zap size={14} className="text-primary fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-300">{activeTab === 'create' ? "Initialisation d'Album" : "Espace Invité"}</span>
          </div>
          <h1 className="text-[2.2rem] md:text-8xl font-black tracking-tighter leading-[1] md:leading-[0.85] flex flex-col items-center">
            <span>{activeTab === 'create' ? 'Capturez' : 'Rejoignez'}</span>
            <span className="text-gradient">{activeTab === 'create' ? "L'éternité" : 'La Réception'}</span>
          </h1>
        </header>

        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-full max-w-md mx-auto relative z-20">
          <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')} icon={<Sparkles size={14}/>} label="Créer un album" />
          <TabButton active={activeTab === 'join'} onClick={() => setActiveTab('join')} icon={<LogIn size={14}/>} label="Rejoindre" />
        </div>

        <div className="glass rounded-[2.5rem] p-6 md:p-12 shadow-2xl space-y-8 border border-white/5 relative overflow-hidden group">
          {activeTab === 'create' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(navigate); }} className="space-y-6 relative z-10">
              <InputGroup label="Nom de l'événement" icon={<Hash size={18}/>} placeholder="Ex: Mariage de Sarah & Marc" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
              
              <div className="grid grid-cols-2 gap-4">
                <SelectGroup label="Réception" icon={<Sparkles size={16}/>} value={formData.eventType} onChange={(v: string) => setFormData({...formData, eventType: v})} options={[{v:'mariage', l:'💍 Mariage'}, {v:'anniversaire', l:'🎂 Anniversaire'}, {v:'soiree', l:'🎉 Fête'}]} />
                <SelectGroup label="Capacité" icon={<Users size={16}/>} value={formData.expectedGuests} onChange={(v: string) => setFormData({...formData, expectedGuests: v})} options={[{v:'50', l:'< 50'}, {v:'100', l:'100'}, {v:'300', l:'300'}]} />
              </div>

              <div className="space-y-4">
                 <InputGroup type="datetime-local" label="Date et heure" icon={<Calendar size={18}/>} value={formData.eventDateTime} onChange={(v: string) => setFormData({...formData, eventDateTime: v})} />
                 <label className="flex items-center space-x-3 cursor-pointer group w-fit ml-2">
                    <div onClick={() => setIsMultiDay(!isMultiDay)} className={`w-10 h-5 rounded-full transition-all relative ${isMultiDay ? 'bg-primary shadow-[0_0_15px_rgba(170,59,255,0.4)]' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isMultiDay ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Multi-jours</span>
                 </label>
              </div>

              {creationError && <ErrorMessage message={creationError} />}
              <SubmitButton loading={loading} label="Créer mon album" icon={<Sparkles size={18}/>} />
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); navigate(`/e/${joinInput.toLowerCase()}`) }} className="space-y-8 relative z-10 text-center animate-in fade-in">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto text-primary"><LogIn size={28} /></div>
              <h2 className="text-xl font-black">Accédez aux Souvenirs</h2>
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

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 py-3.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${active ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
    {icon} <span>{label}</span>
  </button>
)

const InputGroup = ({ label, icon, value, onChange, placeholder, type="text" }: any) => (
  <div className="space-y-3">
    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">{label}</label>
    <div className="relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600">{icon}</div>
      <input type={type} required placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] pl-14 pr-8 py-5 text-sm font-bold outline-none focus:border-primary/50 text-white" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  </div>
)

const SelectGroup = ({ label, icon, value, onChange, options }: any) => (
  <div className="space-y-3">
    <label className="text-[8px] font-black uppercase tracking-widest text-gray-500 ml-2 block truncate">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">{icon}</div>
      <select className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-8 py-4 text-xs font-bold outline-none focus:border-primary/50 appearance-none text-white" value={value} onChange={e => onChange(e.target.value)}>
        {options.map((o: any) => <option key={o.v} value={o.v} className="bg-[#0b0910]">{o.l}</option>)}
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

const SubmitButton = ({ loading, label, icon }: any) => (
  <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white font-black py-6 rounded-[1.5rem] shadow-[0_20px_50px_rgba(170,59,255,0.3)] flex items-center justify-center space-x-4 text-[10px] uppercase tracking-[0.25em] border-t border-white/20">
    {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{label} {icon}</>}
  </button>
)

const BackgroundGlows = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/5 blur-[150px] rounded-full" />
  </div>
)
