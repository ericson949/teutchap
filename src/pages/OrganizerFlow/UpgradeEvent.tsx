import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, ShieldCheck, Zap, ArrowLeft, Loader2, Star, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const PLANS = [
  {
    id: 'free',
    name: 'Essentiel',
    price: 0,
    features: ['100 photos', 'QR Code standard', 'Mur Live basique']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 5000,
    features: ['1 000 photos', 'Défis illimités', 'Mur Live premium', 'Reveal Mode', 'Tagging IA', 'Support Multi-Jours']
  },
  {
    id: 'vip',
    name: 'VIP Élite',
    price: 15000,
    features: ['3 000 photos', 'Branding personnalisé', 'Support prioritaire', 'Modération avancée', 'Multi-Jours + Conciergerie']
  }
]

export default function UpgradeEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [eventData, setEventData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'plans' | 'checkout' | 'success'>('plans')
  const [selectedPlan, setSelectedPlan] = useState<any>(PLANS[1])

  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
      if (data) setEventData(data)
    }
    fetchEvent()
  }, [eventId])

  const handlePayment = async () => {
    setLoading(true)
    // Simulate Payment process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const transactionId = `TX-${Math.random().toString(36).substring(7).toUpperCase()}`
    
    await supabase.from('payments').insert([{
      event_id: eventId,
      amount: selectedPlan.price,
      status: 'completed',
      payment_method: 'orange_money',
      transaction_id: transactionId
    }])

    await supabase.from('events').update({
      plan: selectedPlan.id
    }).eq('id', eventId)

    setLoading(false)
    setStep('success')
  }

  if (!eventData) return <div className="min-h-screen bg-[#08060d] text-white p-8 flex items-center justify-center font-black uppercase tracking-[0.3em]">Chargement...</div>

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full" />
      </div>

      <header className="glass-dark border-b border-white/5 px-6 py-4 flex items-center space-x-4 sticky top-0 z-40 backdrop-blur-2xl">
        <button onClick={() => navigate(-1)} className="p-3 text-gray-400 hover:text-white glass rounded-2xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black text-gradient">Améliorer l'événement</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{eventData.name}</p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto p-4 md:p-12 w-full relative z-10 flex flex-col justify-center">
        {step === 'plans' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
               <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/30 px-6 py-2 rounded-full mb-4 shadow-[0_0_20px_rgba(170,59,255,0.2)]">
                  <Star size={14} className="text-primary fill-current animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Débloquez le plein potentiel</span>
               </div>
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-gradient leading-none">Passez au niveau <br/> Supérieur.</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-center">
              {PLANS.map(plan => (
                <div 
                  key={plan.id}
                  className={`relative p-8 rounded-[2.5rem] border transition-all cursor-pointer group ${
                    selectedPlan.id === plan.id 
                      ? 'border-primary/50 bg-primary/5 shadow-[0_0_50px_rgba(170,59,255,0.15)] scale-105 z-10' 
                      : 'border-white/5 glass hover:border-white/20 hover:-translate-y-2'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {plan.id === 'premium' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-black tracking-widest px-6 py-2 rounded-full uppercase shadow-lg shadow-primary/30 flex items-center space-x-2">
                       <Sparkles size={12} />
                       <span>Recommandé</span>
                    </div>
                  )}
                  <div className="mb-8 text-center mt-2">
                    <h3 className={`text-xl font-black tracking-tight ${selectedPlan.id === plan.id ? 'text-primary' : 'text-gray-300'}`}>{plan.name}</h3>
                    <div className="mt-4 flex items-baseline justify-center">
                      <span className="text-5xl font-black tracking-tighter text-white">{plan.price.toLocaleString()}</span>
                      <span className="ml-2 text-gray-500 text-xs font-bold uppercase tracking-widest">FCFA</span>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center text-sm text-gray-300 font-medium">
                        <Check size={18} className={`${selectedPlan.id === plan.id ? 'text-primary' : 'text-gray-600'} mr-3 shrink-0`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-12 pt-8">
              <button 
                onClick={() => setStep('checkout')}
                className="w-full max-w-md bg-white text-black hover:bg-gray-200 active:scale-95 font-black py-6 rounded-[2rem] shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center space-x-3 text-sm uppercase tracking-widest"
              >
                <span>Continuer vers le paiement</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 'checkout' && (
          <div className="max-w-lg mx-auto w-full glass rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="bg-white/5 p-8 text-center border-b border-white/5 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldCheck size={100} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500 mb-2">Paiement Sécurisé</p>
              <h3 className="text-3xl font-black tracking-tighter">Récapitulatif</h3>
            </div>
            
            <div className="p-8 md:p-10 space-y-8">
              <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Plan Sélectionné</p>
                  <p className="font-black text-xl text-primary">{selectedPlan.name}</p>
                </div>
                <div className="text-right">
                   <span className="text-3xl font-black tracking-tighter">{selectedPlan.price.toLocaleString()}</span>
                   <span className="text-gray-500 text-[10px] ml-1 uppercase font-bold">FCFA</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Méthode de paiement</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-[#FF6600]/50 bg-[#FF6600]/10 rounded-2xl flex flex-col items-center justify-center space-y-2 cursor-pointer shadow-[0_0_20px_rgba(255,102,0,0.1)] transition-all">
                    <div className="w-12 h-12 bg-[#FF6600] rounded-full shadow-lg" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">Orange Money</span>
                  </div>
                  <div className="p-4 border border-white/10 glass rounded-2xl flex flex-col items-center justify-center space-y-2 opacity-50 grayscale cursor-not-allowed">
                    <div className="w-12 h-12 bg-[#FFCC00] rounded-full shadow-lg" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">MTN MoMo</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-[#FF6600] hover:bg-[#E65C00] active:scale-[0.98] transition-all text-white font-black py-6 rounded-[2rem] shadow-[0_20px_50px_rgba(255,102,0,0.3)] flex items-center justify-center space-x-3 text-sm uppercase tracking-widest mt-8"
              >
                {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span>Traitement sécurisé...</span>
                  </>
                ) : (
                  <span>Payer {selectedPlan.price.toLocaleString()} FCFA</span>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="max-w-md mx-auto text-center space-y-8 py-12 animate-in zoom-in-95 duration-500">
            <div className="w-32 h-32 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-8 relative shadow-[0_0_100px_rgba(170,59,255,0.4)]">
              <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20" />
              <ShieldCheck size={64} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gradient">Félicitations !</h2>
              <p className="text-gray-400 leading-relaxed font-medium">
                Votre événement est maintenant propulsé par le plan <strong className="text-white">{selectedPlan.name}</strong>. 
                Toutes les fonctionnalités premium sont activées.
              </p>
            </div>
            <button 
              onClick={() => navigate(`/dashboard/${eventId}`)}
              className="w-full bg-white text-black hover:bg-gray-200 active:scale-95 font-black py-6 rounded-[2rem] shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center space-x-3 text-sm uppercase tracking-widest mt-8"
            >
              <Zap size={18} className="fill-current" />
              <span>Accéder à la console</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function ChevronRight({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
