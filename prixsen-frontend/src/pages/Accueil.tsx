import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import {
  ShoppingCart, Bus, Fuel, Building2, TrendingUp,
  BarChart3, Shield, Users, ArrowRight, Eye, EyeOff, Loader2
} from 'lucide-react';

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "";

export function Accueil() {
  const { login, loginWithGoogle, setPage, user, isLoading } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loadingQuick, setLoadingQuick] = useState('');

  // ✅ CORRIGÉ : login est async, on doit l'await
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await login(email, password);
    if (!ok) setError('Email ou mot de passe incorrect');
  };

  const handleQuickLogin = async (em: string, pw: string) => {
    setLoadingQuick(em);
    setError('');
    const ok = await login(em, pw);
    if (!ok) setError('Erreur de connexion');
    setLoadingQuick('');
  };

  // ✅ CORRIGÉ : loginWithGoogle est async
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setError('');
      const ok = await loginWithGoogle(credentialResponse.credential);
      if (!ok) setError('Erreur de connexion Google');
    }
  };

  const handleGoogleError = () => {
    setError('Erreur de connexion avec Google. Vérifiez que les popups sont autorisés.');
  };

  if (user) {
    setPage('dashboard');
    return null;
  }

  const features = [
    { icon: ShoppingCart, title: 'Prix Alimentaires', desc: '15+ produits suivis en temps réel', color: 'from-blue-500 to-blue-600' },
    { icon: Bus, title: 'Transport', desc: 'Taxi, bus, interurbain', color: 'from-green-500 to-green-600' },
    { icon: Fuel, title: 'Carburant', desc: 'Essence, gasoil, gaz', color: 'from-orange-500 to-orange-600' },
    { icon: Building2, title: 'Logement', desc: 'Loyers par zone', color: 'from-purple-500 to-purple-600' },
    { icon: TrendingUp, title: 'Analyse', desc: 'Inflation & tendances', color: 'from-red-500 to-red-600' },
    { icon: BarChart3, title: 'Comparateur', desc: '10 zones du Sénégal', color: 'from-teal-500 to-teal-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
          Données mises à jour en temps réel
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 leading-tight">
          Suivez le <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">coût de la vie</span><br />au Sénégal
        </h1>
        <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
          PrixSen vous permet de comparer les prix, suivre l'inflation et signaler les prix observés dans votre zone.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3 mb-8">
        {[{ label: 'Produits suivis', value: '50+' }, { label: 'Zones couvertes', value: '10' }, { label: 'Signalements', value: '100+' }].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
            <p className="text-xl sm:text-2xl font-bold text-primary-600">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {features.map((f, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02 }} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
              <f.icon size={20} className="text-white" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">{f.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-4 mb-8">
        {[{ icon: Shield, text: 'Données vérifiées' }, { icon: Users, text: 'Communauté active' }].map((b, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
            <b.icon size={16} className="text-accent-500" />
            <span>{b.text}</span>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-sm mx-auto">
        {!showLogin ? (
          <div className="space-y-3">
            <button onClick={() => setShowLogin(true)} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold text-sm shadow-lg shadow-primary-200 hover:shadow-xl transition-all flex items-center justify-center gap-2">
              Se connecter <ArrowRight size={16} />
            </button>
            <button onClick={() => setPage('inscription')} className="w-full py-3.5 rounded-xl bg-white text-primary-700 border border-primary-200 font-semibold text-sm hover:bg-primary-50 transition-all">
              Créer un compte
            </button>
            <div className="pt-2">
              <div className="relative flex items-center justify-center my-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative px-3 bg-slate-50 text-xs text-slate-400">ou</div>
              </div>
              {GOOGLE_CLIENT_ID ? (
                <div className="flex justify-center">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="continue_with" shape="pill" size="large" width="350" />
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center">Google Auth non configuré</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900 mb-4 text-center">Connexion</h2>
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="votre@email.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Mot de passe</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                    placeholder="••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <button type="submit" disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Connexion...</> : 'Se connecter'}
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative px-3 bg-white text-xs text-slate-400">ou</div>
              </div>
              {GOOGLE_CLIENT_ID ? (
                <div className="flex justify-center">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signin_with" shape="pill" size="large" width="320" />
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center">Google Auth non configuré</p>
              )}

              <button type="button" onClick={() => setShowLogin(false)} className="w-full py-2 text-sm text-slate-500 hover:text-slate-700">← Retour</button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center mb-2">Accès rapide (comptes test)</p>
              <div className="space-y-1.5">
                {[
                  { label: '👤 Citoyen', em: 'user@test.com', pw: '123456' },
                  { label: '🛡️ Modérateur', em: 'mod@test.com', pw: '123456' },
                  { label: '👨‍💻 Admin', em: 'admin@test.com', pw: '123456' },
                ].map(({ label, em, pw }) => (
                  <button key={em} onClick={() => handleQuickLogin(em, pw)} disabled={isLoading || loadingQuick === em}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors disabled:opacity-60 flex items-center justify-between">
                    <span className="text-xs text-slate-600"><strong>{label}</strong> — {em}</span>
                    {loadingQuick === em && <Loader2 size={12} className="animate-spin text-slate-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
      <div className="h-20" />
    </div>
  );
}
