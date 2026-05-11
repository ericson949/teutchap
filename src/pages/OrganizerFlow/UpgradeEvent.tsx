import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, ShieldCheck, Zap, ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    features: ['100 photos', 'QR Code standard', 'Mur Live basique']
  },
  {
    id: 'premium',
    name: 'Premium Mariage',
    price: 5000,
    features: ['1 000 photos', 'Défis illimités', 'Mur Live premium', 'Téléchargement ZIP', 'Reveal Mode']
  },
  {
    id: 'vip',
    name: 'VIP Event',
    price: 15000,
    features: ['3 000 photos', 'Branding personnalisé', 'Support prioritaire', 'Galerie HD']
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
    // Simulate CinetPay process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const transactionId = `TX-${Math.random().toString(36).substring(7).toUpperCase()}`
    
    // 1. Record payment
    await supabase.from('payments').insert([
      {
        event_id: eventId,
        amount: selectedPlan.price,
        status: 'completed',
        payment_method: 'orange_money',
        transaction_id: transactionId
      }
    ])

    // 2. Update event plan
    await supabase.from('events').update({
      plan: selectedPlan.id
    }).eq('id', eventId)

    setLoading(false)
    setStep('success')
  }

  if (!eventData) return <div className="p-8 text-center">Chargement...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center space-x-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Améliorer l'événement</h1>
      </header>

      <main className="flex-1 max-w-4xl mx-auto p-4 md:p-8 w-full">
        {step === 'plans' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-gray-900">Choisissez votre plan</h2>
              <p className="text-gray-500">Augmentez vos limites et débloquez des fonctionnalités exclusives.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PLANS.map(plan => (
                <div 
                  key={plan.id}
                  className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPlan.id === plan.id 
                      ? 'border-primary bg-white shadow-xl shadow-primary/5' 
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {plan.id === 'premium' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      Populaire
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-3xl font-extrabold text-gray-900">{plan.price.toLocaleString()}</span>
                      <span className="ml-1 text-gray-500 text-sm font-medium">FCFA</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start text-sm text-gray-600">
                        <Check size={16} className="text-green-500 mt-0.5 mr-2 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <button 
                onClick={() => setStep('checkout')}
                className="w-full max-w-md bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-3"
              >
                <span>Continuer avec le plan {selectedPlan.name}</span>
                <Zap size={20} className="fill-current" />
              </button>
            </div>
          </div>
        )}

        {step === 'checkout' && (
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gray-900 p-6 text-white text-center">
              <p className="text-xs uppercase tracking-widest opacity-60 mb-1">CinetPay Test Mode</p>
              <h3 className="text-xl font-bold">Paiement Sécurisé</h3>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <span className="text-gray-500">Plan</span>
                <span className="font-bold">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <span className="text-gray-500">Montant</span>
                <span className="text-2xl font-black text-gray-900">{selectedPlan.price.toLocaleString()} FCFA</span>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-900">Mode de paiement</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border-2 border-primary bg-primary/5 rounded-xl flex flex-col items-center justify-center space-y-1">
                    <div className="w-10 h-10 bg-[#FF6600] rounded-full" />
                    <span className="text-[10px] font-bold">Orange Money</span>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-xl flex flex-col items-center justify-center space-y-1 opacity-50 grayscale">
                    <div className="w-10 h-10 bg-[#FFCC00] rounded-full" />
                    <span className="text-[10px] font-bold">MTN MoMo</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-[#FF6600] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Traitement...</span>
                  </>
                ) : (
                  <span>Payer {selectedPlan.price.toLocaleString()} FCFA</span>
                )}
              </button>
              <p className="text-center text-[10px] text-gray-400">
                Ceci est une simulation de paiement pour le mode test.
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="max-w-md mx-auto text-center space-y-6 py-12 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={48} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Paiement Réussi !</h2>
            <p className="text-gray-500 leading-relaxed">
              Votre événement est maintenant passé en plan **{selectedPlan.name}**. 
              Toutes les fonctionnalités ont été débloquées.
            </p>
            <button 
              onClick={() => navigate(`/dashboard/${eventId}`)}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
            >
              Retour au Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
