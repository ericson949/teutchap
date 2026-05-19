import { useEffect } from 'react'
import type React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Calendar, Hash, Image, LogIn, ShieldCheck, Users } from 'lucide-react'
import { useCreateEventLogic } from '../../hooks/useCreateEventLogic'
import { PrimaryButton, SecondaryButton, Surface } from '../../components/ui/primitives'

export default function CreateEvent() {
  const navigate = useNavigate()
  const {
    loading, joinLoading, creationError, isMultiDay, setIsMultiDay,
    activeTab, setActiveTab, joinInput, setJoinInput, joinError,
    formData, setFormData, handleSubmit, handleJoin,
    handleTurnstileVerify, handleTurnstileExpired
  } = useCreateEventLogic()

  useEffect(() => {
    if (activeTab !== 'create') return

    let widgetId: string | null = null
    let interval: any = null

    ;(window as any).onTurnstileSuccess = (token: string) => handleTurnstileVerify(token)
    ;(window as any).onTurnstileExpired = () => handleTurnstileExpired()
    ;(window as any).onTurnstileError = () => handleTurnstileExpired()

    const renderWidget = () => {
      const turnstile = (window as any).turnstile
      const container = document.getElementById('teutchap-turnstile-container')
      if (turnstile && container) {
        try {
          container.innerHTML = ''
          widgetId = turnstile.render('#teutchap-turnstile-container', {
            sitekey: '1x00000000000000000000AA',
            theme: 'dark',
            appearance: 'never',
            callback: 'onTurnstileSuccess',
            'expired-callback': 'onTurnstileExpired',
            'error-callback': 'onTurnstileError',
          })
        } catch (e) {
          console.error('Turnstile render error:', e)
          handleTurnstileVerify('fallback-token')
        }
      }
    }

    if ((window as any).turnstile) {
      renderWidget()
    } else {
      interval = setInterval(() => {
        if ((window as any).turnstile) {
          renderWidget()
          clearInterval(interval)
        }
      }, 100)
    }

    return () => {
      if (interval) clearInterval(interval)
      if (widgetId && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetId)
        } catch (e) {}
      }
      delete (window as any).onTurnstileSuccess
      delete (window as any).onTurnstileExpired
      delete (window as any).onTurnstileError
    }
  }, [activeTab, handleTurnstileVerify, handleTurnstileExpired])

  return (
    <div className="min-h-screen text-[var(--text-main)]">
      <main className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-8 px-5 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/[0.03] px-4 py-2">
            <ShieldCheck size={14} className="text-[var(--accent)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Album evenementiel sans application
            </span>
          </div>

          <div className="space-y-5">
            <h1 className="max-w-xl text-5xl font-semibold leading-[0.95] tracking-tight text-[var(--text-main)] md:text-7xl">
              Rassemblez tous les souvenirs au meme endroit.
            </h1>
            <p className="max-w-lg text-base leading-7 text-[var(--text-muted)]">
              Creez un album, partagez un QR code, et laissez vos invites ajouter leurs photos en quelques secondes.
            </p>
          </div>

          <div className="grid max-w-lg grid-cols-3 gap-3">
            <TrustStat value="30s" label="creation" />
            <TrustStat value="0" label="app requise" />
            <TrustStat value="QR" label="partage" />
          </div>
        </section>

        <Surface className="overflow-hidden p-5 md:p-7">
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-black/20 p-1">
            <Segment active={activeTab === 'create'} onClick={() => setActiveTab('create')} label="Creer" />
            <Segment active={activeTab === 'join'} onClick={() => setActiveTab('join')} label="Rejoindre" />
          </div>

          {activeTab === 'create' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(navigate) }} className="space-y-5">
              <FormIntro title="Nouvel album" description="Configurez l'evenement. Le QR sera pret juste apres la creation." />
              <Field label="Nom de l'evenement" icon={<Hash size={17} />}>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Mariage de Sarah & Marc"
                  className="ui-input"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Type" icon={<Image size={17} />}>
                  <select className="ui-input" value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}>
                    <option value="mariage">Mariage</option>
                    <option value="anniversaire">Anniversaire</option>
                    <option value="corporate">Corporate</option>
                    <option value="graduation">Graduation</option>
                    <option value="funerailles">Hommage</option>
                  </select>
                </Field>
                <Field label="Capacite" icon={<Users size={17} />}>
                  <select className="ui-input" value={formData.expectedGuests} onChange={(e) => setFormData({ ...formData, expectedGuests: e.target.value })}>
                    <option value="50">Moins de 50</option>
                    <option value="100">100 invites</option>
                    <option value="300">300 invites</option>
                  </select>
                </Field>
              </div>

              <Field label="Date et heure" icon={<Calendar size={17} />}>
                <input
                  required
                  type="datetime-local"
                  style={{ colorScheme: 'dark' }}
                  value={formData.eventDateTime}
                  onChange={(e) => setFormData({ ...formData, eventDateTime: e.target.value })}
                  className="ui-input"
                />
              </Field>

              <label className="flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-[var(--line)] bg-white/[0.025] px-4 py-3">
                <button
                  type="button"
                  onClick={() => setIsMultiDay(!isMultiDay)}
                  className={`relative h-6 w-11 rounded-full border transition ${isMultiDay ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-white/15 bg-white/5'}`}
                >
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${isMultiDay ? 'left-6' : 'left-1'}`} />
                </button>
                <span className="text-xs font-semibold text-[var(--text-muted)]">Evenement multi-jours</span>
              </label>

              <div className="flex min-h-8 justify-center">
                <div id="teutchap-turnstile-container" />
              </div>

              {creationError && <ErrorMessage message={creationError} />}
              <PrimaryButton type="submit" disabled={loading} className="w-full">
                {loading ? <Spinner /> : <><span>Creer l'album</span><ArrowRight size={16} /></>}
              </PrimaryButton>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleJoin(navigate) }} className="space-y-6">
              <FormIntro title="Rejoindre un album" description="Entrez le code partage par l'organisateur." />
              <Field label="Code album" icon={<LogIn size={17} />}>
                <input
                  required
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  placeholder="ex: lwidj0ck"
                  className="ui-input text-center font-mono tracking-[0.18em]"
                />
              </Field>
              {joinError && <ErrorMessage message={joinError} />}
              <SecondaryButton type="submit" disabled={joinLoading} className="w-full">
                {joinLoading ? <Spinner /> : <><span>Ouvrir l'album</span><ArrowRight size={16} /></>}
              </SecondaryButton>
            </form>
          )}
        </Surface>
      </main>
    </div>
  )
}

const Segment = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-xl px-4 py-3 text-xs font-semibold transition ${active ? 'bg-white text-black' : 'text-[var(--text-muted)] hover:text-white'}`}
  >
    {label}
  </button>
)

const TrustStat = ({ value, label }: { value: string; label: string }) => (
  <div className="rounded-2xl border border-[var(--line)] bg-white/[0.025] p-4">
    <p className="text-2xl font-semibold text-white">{value}</p>
    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">{label}</p>
  </div>
)

const FormIntro = ({ title, description }: { title: string; description: string }) => (
  <div className="space-y-1 pb-2">
    <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
    <p className="text-sm leading-6 text-[var(--text-muted)]">{description}</p>
  </div>
)

const Field = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <label className="block space-y-2">
    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">{label}</span>
    <span className="relative block">
      <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--text-soft)]">{icon}</span>
      {children}
    </span>
  </label>
)

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
    {message}
  </div>
)

const Spinner = () => <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
