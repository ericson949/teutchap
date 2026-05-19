import { useState, useEffect } from 'react'
import { useEvent } from './useEvent'
import { usePhotos } from './usePhotos'
import { useAppPlans } from './useAppPlans'
import { useEventGuests } from './useEventGuests'

export function useEventOverviewLogic(eventId: string | undefined) {
  const { eventData, loading: eventLoading, isOwner, updateEvent } = useEvent(eventId)
  const { photos } = usePhotos(eventData?.id)
  const { currentConfig } = useAppPlans(eventData?.plan)
  const { guests, updateGuestRole } = useEventGuests(eventData?.id)

  const [copied, setCopied] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [stagedAdmins, setStagedAdmins] = useState<string[]>([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [enablePasswordToggle, setEnablePasswordToggle] = useState(false)
  const [enableAdminsToggle, setEnableAdminsToggle] = useState(false)
  const [isExporting] = useState(false)
  const [exportProgress] = useState(0)

  const [timeRemaining, setTimeRemaining] = useState<any>({
    label: 'Calcul...', phase: 'before_start', days: 0, hours: 0, minutes: 0, seconds: 0
  })

  useEffect(() => {
    if (!eventData) return
    const updateTimer = () => {
      const now = Date.now()
      const start = new Date(eventData.event_date || eventData.created_at).getTime()
      const end = start + 24 * 3600 * 1000 
      
      let target = start
      let label = "Avant début"
      let phase = 'before_start'

      if (now < start) { target = start; label = "Avant début"; phase = 'before_start'; }
      else if (now < end) { target = end; label = "Temps restant"; phase = 'active'; }
      else { setTimeRemaining({ label: "Album révélé", phase: 'finished', days:0, hours:0, minutes:0, seconds:0 }); return; }

      const diff = Math.max(0, target - now)
      setTimeRemaining({
        label, phase,
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }
    updateTimer()
    const itv = setInterval(updateTimer, 1000)
    return () => clearInterval(itv)
  }, [eventData])

  useEffect(() => {
    if (eventData && guests.length > 0) {
      if (eventData.access_password && !enablePasswordToggle) setEnablePasswordToggle(true)
      if (eventData.co_admins?.length > 0 && !enableAdminsToggle) setEnableAdminsToggle(true)
      
      const initialCoAdminPseudos = guests
        .filter(g => eventData.co_admins?.includes(g.user_id))
        .map(g => g.pseudo)
      
      const isIdentical = stagedAdmins.length === initialCoAdminPseudos.length &&
        stagedAdmins.every((val, index) => val === initialCoAdminPseudos[index])
      
      if (!isIdentical) {
        setStagedAdmins(initialCoAdminPseudos)
      }
    }
  }, [eventData, guests, enablePasswordToggle, enableAdminsToggle, stagedAdmins])

  const copyLink = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-9999px"
      textArea.style.top = "0"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
      } catch (err) {
        console.error('Fallback copy failed', err)
      }
      document.body.removeChild(textArea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveAdmins = async () => {
    if (!eventData?.id) return
    setAdminLoading(true)
    try {
      const selectedGuests = guests.filter(g => stagedAdmins.includes(g.pseudo))
      const coAdminIds = selectedGuests.map(g => g.user_id)

      await updateEvent({ co_admins: coAdminIds })

      for (const guest of guests) {
        const isCoAdmin = coAdminIds.includes(guest.user_id)
        const newRole = isCoAdmin ? 'co_admin' : 'guest'
        if (guest.role !== newRole) {
          await updateGuestRole(guest.user_id, newRole)
        }
      }
    } catch (err) {
      console.error("Error saving co-admins:", err)
    } finally {
      setAdminLoading(false)
    }
  }

  return {
    eventData, eventLoading, isOwner, photos, currentConfig, guests,
    copied, setCopied, newPassword, setNewPassword, pwdLoading,
    stagedAdmins, setStagedAdmins, adminLoading,
    enablePasswordToggle, setEnablePasswordToggle, enableAdminsToggle, setEnableAdminsToggle,
    isExporting, exportProgress, timeRemaining,
    updateEvent, updateGuestRole, copyLink,
    handleSetPassword: async (pwd: string) => {
        setPwdLoading(true)
        await updateEvent({ access_password: pwd })
        setPwdLoading(false)
    },
    handleRevokePassword: async () => {
        setPwdLoading(true)
        await updateEvent({ access_password: null })
        setPwdLoading(false)
    },
    handleSaveAdmins
  }
}
