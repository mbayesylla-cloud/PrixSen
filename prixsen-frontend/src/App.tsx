import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { Accueil } from './pages/Accueil';
import { Dashboard } from './pages/Dashboard';
import { Alimentation } from './pages/Alimentation';
import { Transport } from './pages/Transport';
import { Carburant } from './pages/Carburant';
import { Logement } from './pages/Logement';
import { Signaler } from './pages/Signaler';
import { Analyse } from './pages/Analyse';
import { Alertes } from './pages/Alertes';
import { Profil } from './pages/Profil';
import { Inscription } from './pages/Inscription';
import { Confidentialite } from './pages/Confidentialite';
import { Conditions } from './pages/Conditions';

function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <span className="text-5xl">🇸🇳</span>
        <p className="text-xl font-bold text-primary-600 tracking-wide">PRIXSEN</p>
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    </div>
  );
}

function PageRouter() {
  const { currentPage, user } = useStore();

  const publicPages = new Set(['accueil', 'inscription', 'confidentialite', 'conditions']);
  if (!user && !publicPages.has(currentPage)) {
    return <Accueil />;
  }

  switch (currentPage) {
    case 'accueil':        return <Accueil />;
    case 'dashboard':      return <Dashboard />;
    case 'alimentation':   return <Alimentation />;
    case 'transport':      return <Transport />;
    case 'carburant':      return <Carburant />;
    case 'logement':       return <Logement />;
    case 'signaler':       return <Signaler />;
    case 'analyse':        return <Analyse />;
    case 'alertes':        return <Alertes />;
    case 'profil':         return <Profil />;
    case 'inscription':    return <Inscription />;
    case 'confidentialite':return <Confidentialite />;
    case 'conditions':     return <Conditions />;
    default:               return <Accueil />;
  }
}

export function App() {
  const { hydrate, isHydrating, darkMode } = useStore();

  // Réhydratation unique au montage de l'application.
  // Appelle /api/profil avec le token en localStorage pour restaurer la session.
  useEffect(() => {
    hydrate();
  }, []);

  // Appliquer dark mode sur <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  if (isHydrating) return <SplashScreen />;

  return (
    <Layout>
      <PageRouter />
    </Layout>
  );
}
