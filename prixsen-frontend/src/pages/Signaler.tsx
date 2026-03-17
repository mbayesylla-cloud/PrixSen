import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { zones } from '../data/mockData';
import { Camera, Send, CheckCircle, Clock, MapPin, Filter, X, Image, Upload, ZoomIn, Loader2 } from 'lucide-react';

const produitsOptions = [
  'Riz brisé', 'Riz parfumé', 'Huile arachide', 'Huile de palme', 'Sucre', 'Pain',
  'Oignon', 'Pomme de terre', 'Lait poudre', 'Lait frais', 'Poulet', 'Poisson frais',
  'Tomate', 'Mil', 'Café Touba', 'Autre',
];

export function Signaler() {
  const { user, addSignalement, signalements, loadSignalements } = useStore();
  const [produit, setProduit] = useState('');
  const [prix, setPrix] = useState('');
  const [zone, setZone] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [showFullImage, setShowFullImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ✅ Charger les signalements réels depuis l'API au montage
  useEffect(() => {
    loadSignalements();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Veuillez sélectionner une image'); return; }
    if (file.size > 10 * 1024 * 1024) { alert("L'image ne doit pas dépasser 10 Mo"); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // ✅ CORRIGÉ : addSignalement est async, on envoie le vrai File pour l'upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produit || !prix || !zone) return;
    setSending(true);

    const zoneName = zones.find(z => z.id === zone)?.name || zone;

    const ok = await addSignalement({
      produit,
      prix: parseInt(prix),
      zone: zoneName,
      photo: photoFile || undefined, // ✅ envoie le vrai fichier au backend
    });

    setSending(false);
    if (ok) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setProduit('');
        setPrix('');
        setZone('');
        removePhoto();
      }, 2500);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  };

  // ✅ Signalements viennent du store (API réelle), pas du mockData
  const recentSignalements = signalements.slice(0, 20);

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Signaler un prix</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Contribuez à la transparence des prix</p>
      </div>

      {submitted ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-green-800">Merci !</h2>
          <p className="text-sm text-green-600 mt-1">Votre signalement a été envoyé et sera vérifié par notre équipe.</p>
          {photoFile && (
            <p className="text-xs text-green-500 mt-2 flex items-center justify-center gap-1">
              <Camera size={12} /> Photo du ticket jointe avec succès
            </p>
          )}
        </motion.div>
      ) : (
        <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4 mb-6">

          {/* Produit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Produit *</label>
            <select value={produit} onChange={e => setProduit(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required>
              <option value="">Sélectionner un produit</option>
              {produitsOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Prix */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Prix observé (FCFA) *</label>
            <input type="number" value={prix} onChange={e => setPrix(e.target.value)} placeholder="Ex: 350"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required min="0" />
          </div>

          {/* Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Zone *</label>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-primary-500 shrink-0" />
              <select value={zone} onChange={e => setZone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required>
                <option value="">Sélectionner une zone</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
          </div>

          {/* Photo ticket */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Photo du ticket (optionnel)</label>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            {!photoPreview ? (
              <div className="space-y-2">
                <div onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-primary-300 hover:bg-primary-50/50 transition-all flex flex-col items-center gap-2 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Upload size={22} className="text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Choisir une photo</span>
                  <span className="text-xs text-slate-400">Ticket de caisse, étiquette de prix...</span>
                  <span className="text-[10px] text-slate-300">JPG, PNG, HEIC — Max 10 Mo</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-primary-200 bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-all">
                    <Camera size={18} /><span>Prendre photo</span>
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
                    <Image size={18} /><span>Galerie</span>
                  </button>
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-xl overflow-hidden border-2 border-green-300 bg-green-50">
                <div className="relative">
                  <img src={photoPreview} alt="Aperçu du ticket"
                    className="w-full max-h-64 object-contain bg-slate-900/5 cursor-pointer"
                    onClick={() => setShowFullImage(photoPreview)} />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button type="button" onClick={() => setShowFullImage(photoPreview)}
                      className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                      <ZoomIn size={14} />
                    </button>
                    <button type="button" onClick={removePhoto}
                      className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <div className="px-3 py-2.5 flex items-center gap-3 bg-green-50 border-t border-green-200">
                  <CheckCircle size={16} className="text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-800 truncate">{photoFile?.name || 'Photo du ticket'}</p>
                    <p className="text-[10px] text-green-600">{photoFile ? formatFileSize(photoFile.size) : 'Image chargée'}</p>
                  </div>
                  <button type="button" onClick={() => { removePhoto(); setTimeout(() => fileInputRef.current?.click(), 100); }}
                    className="text-xs font-medium text-green-700 hover:text-green-900 underline">Changer</button>
                </div>
              </motion.div>
            )}
          </div>

          <button type="submit" disabled={sending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold text-sm shadow-lg shadow-primary-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {sending ? <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</> : <><Send size={16} /> Envoyer le signalement</>}
          </button>
        </motion.form>
      )}

      {/* Full image modal */}
      <AnimatePresence>
        {showFullImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowFullImage(null)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-lg w-full max-h-[85vh]" onClick={e => e.stopPropagation()}>
              <img src={showFullImage} alt="Photo du ticket" className="w-full max-h-[80vh] object-contain rounded-xl" />
              <button onClick={() => setShowFullImage(null)}
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
              <div className="mt-3 text-center"><p className="text-white/70 text-xs">Appuyez en dehors pour fermer</p></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Signalements récents depuis l'API (store) */}
      <div>
        <button onClick={() => setShowRecent(!showRecent)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          <Filter size={14} />
          Signalements récents ({recentSignalements.length})
        </button>

        {showRecent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {recentSignalements.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Aucun signalement pour l'instant</p>
            ) : (
              recentSignalements.map(s => (
                <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${s.verifie ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {s.verifie ? <CheckCircle size={14} /> : <Clock size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.produit}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.zone} · {s.utilisateur} · {s.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{s.prix} F</p>
                    {s.photo && <span className="text-xs text-slate-400">📷</span>}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
