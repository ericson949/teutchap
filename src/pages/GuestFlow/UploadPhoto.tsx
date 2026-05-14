import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, X, Upload, Zap } from 'lucide-react'
import { useUploadLogic } from '../../hooks/useUploadLogic'
import { UploadActionButtons } from './components/UploadActionButtons'

export default function UploadPhoto() {
  const { token } = useParams()
  const navigate = useNavigate()
  const {
    pendingPhotos, setPendingPhotos, isCompressing, isUploading,
    challenges, selectedChallenge, setSelectedChallenge,
    guestPseudo, handleUpload, compressImage
  } = useUploadLogic(token)

  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const onFileChange = async (e: any) => {
    const files = Array.from(e.target.files as FileList)
    const newPhotos = []
    for (const f of files) {
        const blob = await compressImage(f)
        newPhotos.push({ id: Math.random().toString(36), blob, url: URL.createObjectURL(blob), compressedSize: blob.size })
    }
    setPendingPhotos([...pendingPhotos, ...newPhotos])
  }

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col">
      <header className="glass-dark border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white"><ArrowLeft size={20} /></button>
        <div className="flex flex-col items-center">
          <h1 className="text-xs font-black uppercase tracking-widest text-gradient">Nouveau Souvenir</h1>
          <span className="text-[8px] text-gray-500 font-bold">Signé par {guestPseudo}</span>
        </div>
        <div className="w-8" />
      </header>

      <main className="flex-1 p-4 space-y-6 max-w-xl mx-auto w-full relative z-10">
        {isCompressing ? <LoadingState /> : pendingPhotos.length === 0 ? (
          <UploadActionButtons 
            onCameraClick={() => cameraRef.current?.click()} 
            onGalleryClick={() => galleryRef.current?.click()} 
          />
        ) : (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="grid grid-cols-2 gap-3">
              {pendingPhotos.map(p => (
                <div key={p.id} className="relative glass rounded-2xl aspect-[3/4] overflow-hidden border border-white/10 shadow-xl group">
                  <img src={p.url} className="w-full h-full object-cover" />
                  <button onClick={() => setPendingPhotos(prev => prev.filter(x => x.id !== p.id))} className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white border border-white/10 hover:bg-black/80"><X size={14} /></button>
                  <div className="absolute bottom-2 left-2 glass-dark px-2 py-0.5 rounded text-[8px] font-black text-primary-light">{(p.compressedSize / 1024).toFixed(0)} KB</div>
                </div>
              ))}
            </div>

            {challenges.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center space-x-1.5"><Zap size={12} className="text-primary fill-current"/><span>Associer à un défi ?</span></h3>
                <div className="grid grid-cols-2 gap-2">
                  {challenges.map(c => (
                    <button key={c.id} onClick={() => setSelectedChallenge(selectedChallenge === c.id ? null : c.id)} className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${selectedChallenge === c.id ? 'bg-primary border-primary text-white scale-105 shadow-lg shadow-primary/20' : 'glass border-white/5 text-gray-500'}`}>
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => handleUpload(navigate)} disabled={isUploading} className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-3 border-t border-white/20 disabled:opacity-50">
              {isUploading ? <><Loader2 size={20} className="animate-spin" /><span>Envoi...</span></> : <><Upload size={20} /><span>Publier les souvenirs signés</span></>}
            </button>
          </div>
        )}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
      </main>
    </div>
  )
}

const LoadingState = () => (
  <div className="glass rounded-[2.5rem] p-12 text-center space-y-4 border-primary/20 animate-in fade-in duration-300">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
    <div className="space-y-1">
      <p className="text-sm font-black text-white tracking-tight">Optimisation sur votre appareil...</p>
      <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Compression HD intelligente</p>
    </div>
  </div>
)
