import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { zones } from '../data/mockData';
import { GoogleLogin } from '@react-oauth/google';
import { CheckCircle2, UserPlus, Eye, EyeOff, ChevronRight, Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "";

export function Inscription() {
  const { setPage, register, loginWithGoogle, isLoading } = useStore();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [zone, setZone] = useState('dakar');
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ✅ CORRIGÉ : register est async, on doit l'await
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!acceptCGU || !acceptPrivacy) {
      setError("Vous devez accepter les Conditions d'utilisation et la Politique de confidentialité.");
      return;
    }
    if (!nom || !email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    // ✅ Le zone sélectionné est l'id (ex: "dakar"), on envoie le nom complet
    const zoneNom = zones.find(z => z.id === zone)?.name || zone;
    const ok = await register({ nom, email, password, zone: zoneNom });

    if (!ok) {
      setError('Cette adresse email est déjà utilisée.');
      return;
    }
    setSuccess(true);
    // Le store navigue automatiquement vers dashboard après login réussi
  };

  // ✅ CORRIGÉ : loginWithGoogle est async
  // Le compte Google est automatiquement créé en base si nouveau
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!acceptCGU || !acceptPrivacy) {
      setError("Vous devez d'abord accepter les Conditions d'utilisation et la Politique de confidentialité.");
      return;
    }
    if (credentialResponse.credential) {
      setError('');
      const ok = await loginWithGoogle(credentialResponse.credential);
      if (ok) {
        setSuccess(true);
      } else {
        setError("Erreur lors de l'inscription avec Google");
      }
    }
  };

  const handleGoogleError = () => {
    setError('Erreur de connexion avec Google. Vérifiez que les popups sont autorisés.');
  };

  return (
    <div className="max-w-md mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Créer un compte</h1>
        <p className="text-sm text-slate-500 mt-1">Rejoignez PrixSen et contribuez à la transparence des prix</p>
      </motion.div>

      {success ? (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
          <p className="text-lg font-semibold text-green-700">Compte créé avec succès !</p>
          <p className="text-sm text-green-600 mt-1">Redirection vers votre tableau de bord...</p>
        </motion.div>
      ) : (
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">

          {/* Nom */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom complet *</label>
            <input value={nom} onChange={e => setNom(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Mamadou Diallo" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adresse email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="vous@email.com" />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mot de passe *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                placeholder="Minimum 6 caractères" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Votre zone *</label>
            <select value={zone} onChange={e => setZone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name} — Région {z.region}</option>
              ))}
            </select>
          </div>

          {/* CGU + Confidentialité */}
          <div className="pt-2 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={acceptCGU} onChange={e => setAcceptCGU(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                J'accepte les{' '}
                <button type="button" onClick={() => setPage('conditions')}
                  className="text-primary-600 font-medium underline underline-offset-2 hover:text-primary-700">
                  Conditions d'utilisation
                </button>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={acceptPrivacy} onChange={e => setAcceptPrivacy(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                J'accepte la{' '}
                <button type="button" onClick={() => setPage('confidentialite')}
                  className="text-primary-600 font-medium underline underline-offset-2 hover:text-primary-700">
                  Politique de confidentialité
                </button>
              </span>
            </label>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Bouton soumettre */}
          <button type="submit" disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold text-sm shadow-lg shadow-primary-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Création...</> : <><UserPlus size={18} /> Créer mon compte</>}
          </button>

          {/* Google Sign Up */}
          {GOOGLE_CLIENT_ID && (
            <>
              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative px-3 bg-white text-xs text-slate-400">ou</div>
              </div>
              <div className="flex justify-center">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signup_with" shape="pill" size="large" width="350" />
              </div>
              {(!acceptCGU || !acceptPrivacy) && (
                <p className="text-xs text-amber-600 text-center">
                  ⚠️ Cochez les deux cases ci-dessus avant de vous inscrire avec Google
                </p>
              )}
            </>
          )}

          {/* Lien vers connexion */}
          <div className="text-center pt-2">
            <button type="button" onClick={() => setPage('accueil')}
              className="text-sm text-slate-500 hover:text-primary-600 transition-colors inline-flex items-center gap-1">
              <ChevronRight size={14} className="rotate-180" />
              J'ai déjà un compte — Se connecter
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}
