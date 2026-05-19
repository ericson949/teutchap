import React from 'react'
import { Camera } from 'lucide-react'
import PremiumTabs from '../../../components/PremiumTabs'

interface GuestBottomNavProps {
  tabs: any[]
  activeTab: string
  setActiveTab: (val: string) => void
  onCaptureClick: () => void
}

export const GuestBottomNav: React.FC<GuestBottomNavProps> = ({ tabs, activeTab, setActiveTab, onCaptureClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-app)] via-[var(--bg-app)]/95 to-transparent pointer-events-none" />

      <div className="relative flex flex-col items-center p-4 md:p-6">
        <button
          onClick={onCaptureClick}
          className="z-10 mb-4 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-4 border-[var(--bg-app)] bg-[var(--text-primary)] text-[var(--text-inverse)] shadow-[0_18px_42px_rgba(0,0,0,0.42)] transition-all hover:bg-white active:scale-95"
          aria-label="Ajouter une photo"
        >
          <Camera size={26} className="stroke-[2.5]" />
        </button>

        <PremiumTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="w-full max-w-md"
        />
      </div>
    </div>
  )
}
