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
      <div className="absolute inset-0 bg-gradient-to-t from-[#08060d] via-[#08060d]/95 to-transparent pointer-events-none" />
      
      <div className="relative p-4 md:p-6 flex flex-col items-center">
        {/* Floating Capture Button */}
        <button 
          onClick={onCaptureClick}
          className="mb-4 w-16 h-16 bg-primary hover:bg-primary-dark active:scale-95 transition-all text-white rounded-full shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)] flex items-center justify-center border-4 border-[#08060d] z-10"
        >
          <Camera size={28} />
        </button>

        {/* Premium Bottom Navigation */}
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
