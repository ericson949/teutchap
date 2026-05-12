import { useState, useEffect } from 'react'
import { Download, Share2, X, Smartphone } from 'lucide-react'

// Déclaration d'interface pour l'événement d'installation natif
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // 1. Vérification si l'application est déjà en mode autonome (installée)
    const checkStandalone = () => {
      const isStandAloneMedia = window.matchMedia('(display-mode: standalone)').matches
      const isStandAloneNav = (window.navigator as any).standalone === true
      return isStandAloneMedia || isStandAloneNav
    }

    if (checkStandalone()) {
      setIsStandalone(true)
      return
    }

    // 2. Vérification si l'utilisateur a déjà masqué la bannière
    const dismissed = localStorage.getItem('teutchap_pwa_dismissed')
    if (dismissed === 'true') {
      return
    }

    // 3. Détection de la plateforme iOS (iPhone, iPad, iPod)
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIos(isIosDevice)

    if (isIosDevice) {
      // Sur iOS, nous affichons la bannière après un court délai pour laisser l'app charger
      const timer = setTimeout(() => setIsVisible(true), 2500)
      return () => clearTimeout(timer)
    }

    // 4. Interception de l'événement natif d'installation Chrome/Android
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêche Chrome d'afficher automatiquement son mini-infobar
      e.preventDefault()
      // Stocke l'événement pour pouvoir déclencher le prompt plus tard
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Déclenche l'invite native d'installation
    await deferredPrompt.prompt()
    
    // Attend le choix de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      console.log('PWA installée avec succès !')
      setIsVisible(false)
      localStorage.setItem('teutchap_pwa_dismissed', 'true')
    }
    // Nettoie la référence
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('teutchap_pwa_dismissed', 'true')
  }

  // Ne rien rendre si l'application est en plein écran ou si la bannière n'est pas activée
  if (isStandalone || !isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="glass rounded-2xl p-4 border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl bg-[#08060d]/80 text-white relative overflow-hidden group">
        {/* Lueur d'accentuation en arrière-plan */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/20 blur-[30px] rounded-full pointer-events-none" />
        
        <button 
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 text-gray-500 hover:text-white transition-colors p-1"
          aria-label="Fermer"
        >
          <X size={14} />
        </button>

        <div className="flex items-start space-x-3 pr-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shrink-0 shadow-lg border border-white/20 mt-0.5">
            <Smartphone size={20} className="drop-shadow animate-pulse-slow" />
          </div>

          <div className="space-y-2 flex-1 text-left">
            <div>
              <h4 className="text-xs font-black tracking-tight text-white uppercase">
                Installer Teutchap
              </h4>
              <p className="text-[10px] text-gray-400 font-medium leading-snug">
                Accédez à l'album instantanément en plein écran et économisez vos données.
              </p>
            </div>

            {isIos ? (
              // Instructions sur-mesure pour iOS (Safari)
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 space-y-1.5 text-[10px]">
                <div className="text-gray-300 flex items-center space-x-1.5">
                  <span className="bg-primary/20 text-primary font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]">1</span>
                  <span>Touchez l'icône Partage</span>
                  <Share2 size={10} className="inline text-primary" />
                </div>
                <div className="text-gray-300 flex items-center space-x-1.5">
                  <span className="bg-primary/20 text-primary font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]">2</span>
                  <span>Sélectionnez <strong className="text-white">"Sur l'écran d'accueil"</strong></span>
                </div>
              </div>
            ) : (
              // Bouton d'action directe pour Android / Chrome
              <div className="pt-1">
                <button 
                  onClick={handleInstallClick}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-black text-[10px] uppercase tracking-widest py-2 px-3 rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center space-x-1.5 border border-white/20"
                >
                  <Download size={12} className="animate-bounce" />
                  <span>Installer l'application</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
