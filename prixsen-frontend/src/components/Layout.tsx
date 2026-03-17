import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  Home, BarChart3, ShoppingCart, Bus, Fuel, Building2,
  MessageSquarePlus, User, Bell, LogOut, Menu, X, TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { id: 'accueil', label: 'Accueil', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'alimentation', label: 'Alimentation', icon: ShoppingCart },
  { id: 'transport', label: 'Transport', icon: Bus },
  { id: 'carburant', label: 'Carburant', icon: Fuel },
  { id: 'logement', label: 'Logement', icon: Building2 },
  { id: 'signaler', label: 'Signaler', icon: MessageSquarePlus },
  { id: 'analyse', label: 'Analyse', icon: TrendingUp },
  { id: 'alertes', label: 'Alertes', icon: Bell },
  { id: 'profil', label: 'Profil', icon: User },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentPage, setPage, user, logout, alertes, darkMode, loadAlertes } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const unreadCount = alertes.filter(a => !a.lue).length;

  // Charger les alertes depuis l'API dès que l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      loadAlertes();
    }
  }, [user?.email]);

  // Écouter les sessions expirées (token refresh échoué)
  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
    };
    window.addEventListener('prixsen:session_expired', handleSessionExpired);
    return () => window.removeEventListener('prixsen:session_expired', handleSessionExpired);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.background = '#0f172a';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.background = '#f8fafc';
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setPage('accueil')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">Prix<span className="text-primary-600 dark:text-primary-400">Sen</span></span>
          </button>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={() => setPage('alertes')}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors lg:hidden"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 transition-colors duration-300">
          <nav className="space-y-1">
            {navItems.map(item => {
              if (!user && !['accueil'].includes(item.id)) return null;
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.id === 'alertes' && unreadCount > 0 && (
                    <span className="ml-auto w-5 h-5 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          {user && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={async () => { await logout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </aside>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMenuOpen(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-slate-800 shadow-xl p-4 pt-16 transition-colors duration-300"
                onClick={e => e.stopPropagation()}
              >
                {user && (
                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center gap-3">
                    <span className="text-2xl">{user.avatar}</span>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.nom}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                )}
                <nav className="space-y-1">
                  {navItems.map(item => {
                    if (!user && !['accueil'].includes(item.id)) return null;
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setPage(item.id); setMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
                {user && (
                  <button
                    onClick={async () => { await logout(); setMenuOpen(false); }}
                    className="mt-4 w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 lg:p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 lg:hidden safe-area-bottom transition-colors duration-300">
          <div className="flex justify-around items-center h-16 px-2">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Board' },
              { id: 'alimentation', icon: ShoppingCart, label: 'Prix' },
              { id: 'signaler', icon: MessageSquarePlus, label: 'Signaler' },
              { id: 'analyse', icon: TrendingUp, label: 'Analyse' },
              { id: 'profil', icon: User, label: 'Profil' },
            ].map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
                    isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
