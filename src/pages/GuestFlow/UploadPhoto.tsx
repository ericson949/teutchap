import { useRef, useState } from 'react'
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
    guestPseudo, handleUpload, compressImage,
    shouldCompress, setShouldCompress
  } = useUploadLogic(token)

  const [showConfirmModal, setShowConfirmModal] = useState(false)


  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const onFileChange = async (e: any) => {
    const files = Array.from(e.target.files as FileList)
    const newPhotos = []
    for (const f of files) {
        const blob = shouldCompress ? await compressImage(f) : f
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
        
        {/* Toggle de compression éco-responsable */}
        <div className="glass p-5 rounded-[2rem] border border-white/5 flex items-center justify-between space-x-4 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-24 h-24 bg-blue-500/10 rounded-full blur-[30px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />
          
          <div className="space-y-1 relative z-10">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Optimisation HD</h4>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-tight">
              {shouldCompress 
                ? "Compression active (économise vos données mobiles)" 
                : "Qualité originale (fichiers volumineux)"}
            </p>
          </div>
          <button 
            onClick={() => setShouldCompress(!shouldCompress)} 
            className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${shouldCompress ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}
          >

            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${shouldCompress ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

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
                  <div className="absolute bottom-2 left-2 glass-dark px-2 py-0.5 rounded text-[8px] font-black text-blue-400">{(p.compressedSize / 1024).toFixed(0)} KB</div>
                </div>
              ))}
            </div>

            {challenges.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center space-x-1.5"><Zap size={12} className="text-blue-500 fill-current"/><span>Associer à un défi ?</span></h3>
                <div className="grid grid-cols-2 gap-2">
                  {challenges.map(c => (
                    <button key={c.id} onClick={() => setSelectedChallenge(selectedChallenge === c.id ? null : c.id)} className={`p-3 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border ${selectedChallenge === c.id ? 'bg-blue-600 border-blue-500 text-white scale-105 shadow-lg shadow-blue-500/20' : 'glass border-white/5 text-gray-400 hover:text-white'}`}>
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => setShowConfirmModal(true)} 
              disabled={isUploading} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-bold py-4 rounded-2xl shadow-[0_10px_25px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center space-x-2 text-[10px] uppercase tracking-[0.2em] active:scale-95 cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Publier les souvenirs signés</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Modale de prévisualisation et confirmation finale client */}
        {showConfirmModal && pendingPhotos.length > 0 && (
          <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="glass rounded-[3rem] p-8 max-w-sm w-full border border-white/10 flex flex-col space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none" />
              
              <div className="space-y-1 text-center">
                <h3 className="text-lg font-serif text-white">Prêt à publier ?</h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                  {pendingPhotos.length} {pendingPhotos.length > 1 ? 'photos prêtes à l\'envoi' : 'photo prête à l\'envoi'}
                </p>
              </div>

              {/* Résumé des options sélectionnées */}
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <div className="flex justify-between">
                  <span>Optimisation HD :</span>
                  <span className="text-white">{shouldCompress ? "Oui (Léger)" : "Non (Qualité originale)"}</span>
                </div>
                {selectedChallenge && (
                  <div className="flex justify-between">
                    <span>Défi associé :</span>
                    <span className="text-blue-400 truncate max-w-[150px]">
                      {challenges.find(c => c.id === selectedChallenge)?.title || "Oui"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/5 pt-2">
                  <span>Poids total estimé :</span>
                  <span className="text-white">
                    {(pendingPhotos.reduce((sum, p) => sum + p.compressedSize, 0) / 1024).toFixed(0)} KB
                  </span>
                </div>
              </div>

              {/* Boutons de confirmation */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-4 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-400 hover:bg-white/5 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleUpload(navigate);
                  }}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Publier</span>
                </button>
              </div>
            </div>
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
