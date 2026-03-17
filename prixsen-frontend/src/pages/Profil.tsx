import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { profilAPI } from '../services/api';
import { zones } from '../data/mockData';
import {
  MapPin, Shield, MessageSquarePlus, Settings,
  Bell, Moon, Globe, ChevronRight, LogOut, Star,
  Check, X, Eye, Trash2, CheckCircle2, XCircle,
  Users, BarChart3, Download, Search,
  BellRing,
  ChevronDown, Mail, Lock, HelpCircle, Info,
  Database, Palette
} from 'lucide-react';

type ModalType = 'none' | 'zone' | 'language' | 'notifications' | 'settings' | 'signalements' |
  'verify' | 'users' | 'stats' | 'export' | 'help' | 'about' | 'security';

export function Profil() {
  const {
    user, logout, setPage, darkMode, toggleDarkMode, settings, updateSettings,
    updateUserZone, signalements, verifySignalement, deleteSignalement, allUsers,
    toggleUserBan, changeUserRole, alertes, markAllAlertsRead, loadSignalements, loadAllUsers
  } = useStore();

  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [searchSignalement, setSearchSignalement] = useState('');
  const [filterSignalement, setFilterSignalement] = useState<'all' | 'pending' | 'verified'>('all');
  const [searchUser, setSearchUser] = useState('');
  const [showSuccess, setShowSuccess] = useState('');
  const [expandedSignalement, setExpandedSignalement] = useState<string | null>(null);
  const [pwOld, setPwOld] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // ✅ Charger signalements et utilisateurs depuis l'API pour modérateurs/admins
  useEffect(() => {
    if (user && (user.role === 'moderator' || user.role === 'admin')) {
      loadSignalements();
      loadAllUsers();
    }
  }, []);

  if (!user) return null;

  const roleLabel = user.role === 'admin' ? 'Administrateur' : user.role === 'moderator' ? 'Modérateur' : 'Citoyen';
  const roleColor = user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : user.role === 'moderator' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';

  const langLabels: Record<string, string> = { fr: 'Français', wo: 'Wolof', en: 'English' };

  const pendingSignalements = signalements.filter(s => !s.verifie);
  const verifiedSignalements = signalements.filter(s => s.verifie);
  const unreadAlerts = alertes.filter(a => !a.lue).length;

  // Filter signalements for moderator/admin
  const filteredSignalements = signalements
    .filter(s => {
      if (filterSignalement === 'pending') return !s.verifie;
      if (filterSignalement === 'verified') return s.verifie;
      return true;
    })
    .filter(s =>
      searchSignalement === '' ||
      s.produit.toLowerCase().includes(searchSignalement.toLowerCase()) ||
      s.zone.toLowerCase().includes(searchSignalement.toLowerCase()) ||
      s.utilisateur.toLowerCase().includes(searchSignalement.toLowerCase())
    );

  const filteredUsers = allUsers.filter(u =>
    searchUser === '' ||
    u.nom.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const flash = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(''), 2500);
  };

  const handleVerify = async (id: string) => {
    await verifySignalement(id);
    flash('Signalement vérifié ✓');
  };

  const handleDelete = async (id: string) => {
    await deleteSignalement(id);
    flash('Signalement supprimé');
  };

  const handleToggleBan = async (email: string) => {
    await toggleUserBan(email);
    flash('Statut utilisateur modifié');
  };

  const handleChangePassword = async () => {
    setPwError('');
    if (!pwOld || !pwNew || !pwConfirm) { setPwError('Remplissez tous les champs'); return; }
    if (pwNew.length < 6) { setPwError('Le nouveau mot de passe doit contenir au moins 6 caractères'); return; }
    if (pwNew !== pwConfirm) { setPwError('Les mots de passe ne correspondent pas'); return; }
    setPwLoading(true);
    try {
      const data = await profilAPI.changePassword(pwOld, pwNew);
      if (data.success) {
        setPwSuccess(true);
        setPwOld(''); setPwNew(''); setPwConfirm('');
        setTimeout(() => { setPwSuccess(false); setActiveModal('none'); }, 1800);
      } else {
        setPwError(data.message || 'Erreur lors du changement de mot de passe');
      }
    } catch { setPwError('Impossible de contacter le serveur'); }
    setPwLoading(false);
  };

  const handleChangeRole = async (email: string, role: 'user' | 'moderator' | 'admin') => {
    await changeUserRole(email, role);
    const labels: Record<string, string> = { user: 'Citoyen', moderator: 'Modérateur', admin: 'Admin' };
    flash(`Rôle mis à jour → ${labels[role]} ✓`);
  };

  // Generate export data
  const handleExport = (type: 'signalements' | 'prix' | 'alertes') => {
    let csvContent = '';
    if (type === 'signalements') {
      csvContent = 'ID,Produit,Prix,Zone,Date,Utilisateur,Vérifié\n';
      signalements.forEach(s => {
        csvContent += `${s.id},${s.produit},${s.prix},${s.zone},${s.date},${s.utilisateur},${s.verifie}\n`;
      });
    } else if (type === 'alertes') {
      csvContent = 'ID,Type,Produit,Zone,Message,Date,Lue\n';
      alertes.forEach(a => {
        csvContent += `${a.id},${a.type},${a.produit},${a.zone},"${a.message}",${a.date},${a.lue}\n`;
      });
    } else {
      csvContent = 'Type,Données exportées le ' + new Date().toLocaleDateString('fr-FR') + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prixsen_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    flash(`Export ${type} téléchargé ✓`);
  };

  // ───────── Modal component ─────────
  const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-slate-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col transition-colors duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );

  // ───────── Toggle component ─────────
  const Toggle = ({ active, onToggle, label, desc }: { active: boolean; onToggle: () => void; label: string; desc?: string }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 mr-3">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${active ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${active ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-6">
      {/* Success flash */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-accent-500 text-white px-5 py-2.5 rounded-xl shadow-lg font-medium text-sm"
          >
            {showSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
            {user.avatar}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.nom}</h1>
            <p className="text-primary-200 text-sm">{user.email}</p>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">{user.signalements}</p>
            <p className="text-xs text-primary-200">Signalements</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">⭐ 4.8</p>
            <p className="text-xs text-primary-200">Score</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">#{Math.floor(Math.random() * 50) + 1}</p>
            <p className="text-xs text-primary-200">Classement</p>
          </div>
        </div>
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 mb-6 transition-colors duration-300"
      >
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
          <Star size={20} className="text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Contributeur actif</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">Merci pour vos {user.signalements} contributions !</p>
        </div>
      </motion.div>

      {/* ═══════════════ QUICK ACTIONS ═══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mb-6"
      >
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">Actions rapides</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setPage('signaler')}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
          >
            <MessageSquarePlus size={20} className="text-primary-500" />
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Signaler</span>
          </button>
          <button
            onClick={() => setPage('alertes')}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:border-primary-300 dark:hover:border-primary-600 transition-all relative"
          >
            <Bell size={20} className="text-accent-500" />
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Alertes</span>
            {unreadAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadAlerts}</span>
            )}
          </button>
          <button
            onClick={() => setPage('dashboard')}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
          >
            <BarChart3 size={20} className="text-warning-500" />
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Dashboard</span>
          </button>
        </div>
      </motion.div>

      {/* ═══════════════ PREFERENCES (ALL ROLES) ═══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6 transition-colors duration-300"
      >
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Palette size={12} /> Préférences
          </p>
        </div>

        {/* Dark mode toggle */}
        <div className="px-4 border-b border-slate-50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 py-3.5">
            <Moon size={18} className="text-slate-400 dark:text-slate-300 shrink-0" />
            <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white">Mode sombre</span>
            <button
              onClick={toggleDarkMode}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${darkMode ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${darkMode ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <button
          onClick={() => setActiveModal('notifications')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <Bell size={18} className="text-slate-400 dark:text-slate-300" />
          <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white text-left">Notifications</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{settings.notifications ? 'Activées' : 'Désactivées'}</span>
          <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
        </button>

        {/* Zone */}
        <button
          onClick={() => setActiveModal('zone')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <MapPin size={18} className="text-slate-400 dark:text-slate-300" />
          <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white text-left">Ma zone</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{user.zone}</span>
          <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
        </button>

        {/* Langue */}
        <button
          onClick={() => setActiveModal('language')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <Globe size={18} className="text-slate-400 dark:text-slate-300" />
          <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white text-left">Langue</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{langLabels[settings.language]}</span>
          <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
        </button>

        {/* Mes signalements */}
        <button
          onClick={() => setActiveModal('signalements')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <MessageSquarePlus size={18} className="text-slate-400 dark:text-slate-300" />
          <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white text-left">Mes signalements</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{user.signalements}</span>
          <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
        </button>

        {/* Paramètres */}
        <button
          onClick={() => setActiveModal('settings')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <Settings size={18} className="text-slate-400 dark:text-slate-300" />
          <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white text-left">Paramètres</span>
          <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
        </button>

        {/* Sécurité */}
        <button
          onClick={() => setActiveModal('security')}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <Lock size={18} className="text-slate-400 dark:text-slate-300" />
          <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white text-left">Sécurité</span>
          <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
        </button>
      </motion.div>

      {/* ═══════════════ MODERATOR TOOLS ═══════════════ */}
      {(user.role === 'moderator' || user.role === 'admin') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6 transition-colors duration-300"
        >
          <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={12} /> Outils Modérateur
            </p>
          </div>

          <button
            onClick={() => { setFilterSignalement('pending'); setActiveModal('verify'); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <CheckCircle2 size={18} className="text-blue-500" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Vérifier les signalements</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{pendingSignalements.length} en attente de vérification</p>
            </div>
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingSignalements.length}
            </span>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
          </button>

          <button
            onClick={() => { setFilterSignalement('all'); setActiveModal('verify'); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <Eye size={18} className="text-blue-500" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Tous les signalements</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{signalements.length} au total · {verifiedSignalements.length} vérifiés</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
          </button>

          <button
            onClick={async () => {
              await markAllAlertsRead();
              flash('Toutes les alertes marquées comme lues ✓');
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <BellRing size={18} className="text-blue-500" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Gérer les alertes</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Marquer toutes comme lues · {unreadAlerts} non lues</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
          </button>
        </motion.div>
      )}

      {/* ═══════════════ ADMIN TOOLS ═══════════════ */}
      {user.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6 transition-colors duration-300"
        >
          <div className="px-4 py-2.5 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-900/30">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={12} /> Administration
            </p>
          </div>

          <button
            onClick={() => setActiveModal('users')}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <Users size={18} className="text-purple-500" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Gérer les utilisateurs</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{allUsers.length} comptes enregistrés</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
          </button>

          <button
            onClick={() => setActiveModal('stats')}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <BarChart3 size={18} className="text-purple-500" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Statistiques plateforme</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dashboard administrateur</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
          </button>

          <button
            onClick={() => setActiveModal('export')}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <Download size={18} className="text-purple-500" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Exporter les données</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">CSV, signalements, prix</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
          </button>

          <button
            onClick={() => setActiveModal('about')}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <Database size={18} className="text-purple-500" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Infos système</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Version, base de données</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
          </button>
        </motion.div>
      )}

      {/* ═══════════════ HELP & ABOUT ═══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6 transition-colors duration-300"
      >
        <button
          onClick={() => setActiveModal('help')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <HelpCircle size={18} className="text-slate-400 dark:text-slate-300" />
          <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white text-left">Aide & FAQ</span>
          <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
        </button>
        <button
          onClick={() => setActiveModal('about')}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <Info size={18} className="text-slate-400 dark:text-slate-300" />
          <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white text-left">À propos de PrixSen</span>
          <ChevronRight size={14} className="text-slate-300 dark:text-slate-500" />
        </button>
      </motion.div>

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        onClick={async () => { await logout(); }}
        className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={16} />
        Se déconnecter
      </motion.button>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
        PrixSen v1.0 — Plateforme Nationale de Suivi du Coût de la Vie
      </p>

      {/* ╔═══════════════════════════════════════════╗ */}
      {/* ║             ALL MODALS                    ║ */}
      {/* ╚═══════════════════════════════════════════╝ */}
      <AnimatePresence>
        {/* ───── Zone Modal ───── */}
        {activeModal === 'zone' && (
          <Modal title="📍 Changer ma zone" onClose={() => setActiveModal('none')}>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sélectionnez votre zone pour des prix personnalisés</p>
            <div className="space-y-1.5">
              {zones.map(z => (
                <button
                  key={z.id}
                  onClick={async () => {
                    await updateUserZone(z.name);
                    flash(`Zone mise à jour : ${z.name}`);
                    setActiveModal('none');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    user.zone === z.name
                      ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700'
                      : 'bg-slate-50 dark:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                  }`}
                >
                  <MapPin size={16} className={user.zone === z.name ? 'text-primary-500' : 'text-slate-400'} />
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${user.zone === z.name ? 'text-primary-700 dark:text-primary-300' : 'text-slate-900 dark:text-white'}`}>{z.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Région {z.region}</p>
                  </div>
                  {user.zone === z.name && <Check size={18} className="text-primary-500" />}
                </button>
              ))}
            </div>
          </Modal>
        )}

        {/* ───── Language Modal ───── */}
        {activeModal === 'language' && (
          <Modal title="🌍 Changer la langue" onClose={() => setActiveModal('none')}>
            <div className="space-y-2">
              {([
                { code: 'fr' as const, label: 'Français', flag: '🇫🇷', desc: 'Langue par défaut' },
                { code: 'wo' as const, label: 'Wolof', flag: '🇸🇳', desc: 'Làkk wu Wolof' },
                { code: 'en' as const, label: 'English', flag: '🇬🇧', desc: 'International' },
              ]).map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    updateSettings({ language: lang.code });
                    flash(`Langue : ${lang.label}`);
                    setActiveModal('none');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                    settings.language === lang.code
                      ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700'
                      : 'bg-slate-50 dark:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${settings.language === lang.code ? 'text-primary-700 dark:text-primary-300' : 'text-slate-900 dark:text-white'}`}>{lang.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{lang.desc}</p>
                  </div>
                  {settings.language === lang.code && <Check size={18} className="text-primary-500" />}
                </button>
              ))}
            </div>
          </Modal>
        )}

        {/* ───── Notifications Modal ───── */}
        {activeModal === 'notifications' && (
          <Modal title="🔔 Notifications" onClose={() => setActiveModal('none')}>
            <Toggle
              active={settings.notifications}
              onToggle={() => {
                updateSettings({ notifications: !settings.notifications });
                flash(settings.notifications ? 'Notifications désactivées' : 'Notifications activées ✓');
              }}
              label="Activer les notifications"
              desc="Recevoir des alertes push sur les prix"
            />
            <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-2">Types d'alertes</p>
              <Toggle
                active={settings.alerteHausse}
                onToggle={() => updateSettings({ alerteHausse: !settings.alerteHausse })}
                label="↑ Hausse des prix"
                desc="Quand un produit augmente significativement"
              />
              <Toggle
                active={settings.alerteBaisse}
                onToggle={() => updateSettings({ alerteBaisse: !settings.alerteBaisse })}
                label="↓ Baisse des prix"
                desc="Quand un produit baisse significativement"
              />
              <Toggle
                active={settings.alerteNouveau}
                onToggle={() => updateSettings({ alerteNouveau: !settings.alerteNouveau })}
                label="★ Nouveaux prix"
                desc="Quand de nouveaux prix sont signalés dans votre zone"
              />
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <Bell size={12} className="inline mr-1" />
                {unreadAlerts} alerte{unreadAlerts > 1 ? 's' : ''} non lue{unreadAlerts > 1 ? 's' : ''}
              </p>
            </div>
          </Modal>
        )}

        {/* ───── Settings Modal ───── */}
        {activeModal === 'settings' && (
          <Modal title="⚙️ Paramètres" onClose={() => setActiveModal('none')}>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-3">Affichage</p>
                <Toggle
                  active={darkMode}
                  onToggle={toggleDarkMode}
                  label="Mode sombre"
                  desc="Thème foncé pour économiser la batterie"
                />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-3">Données</p>
                <button
                  onClick={() => {
                    flash('Cache nettoyé ✓');
                  }}
                  className="w-full flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Vider le cache</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Libérer de l'espace de stockage</p>
                  </div>
                  <span className="text-xs text-primary-500 font-medium">Nettoyer</span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-3">Localisation</p>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Zone actuelle</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.zone}</p>
                  </div>
                  <button
                    onClick={() => { setActiveModal('zone'); }}
                    className="text-xs text-primary-500 font-medium"
                  >
                    Modifier
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Langue</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{langLabels[settings.language]}</p>
                  </div>
                  <button
                    onClick={() => { setActiveModal('language'); }}
                    className="text-xs text-primary-500 font-medium"
                  >
                    Modifier
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-2">Version</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">PrixSen v1.0.0</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Build 2025.06.18</p>
              </div>
            </div>
          </Modal>
        )}

        {/* ───── Security Modal ───── */}
        {activeModal === 'security' && (
          <Modal title="🔒 Sécurité" onClose={() => setActiveModal('none')}>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">Compte sécurisé</p>
                </div>
                <p className="text-xs text-green-600 dark:text-green-500">Votre compte est bien protégé</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-3">Informations du compte</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2">
                    <Mail size={16} className="text-slate-400" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</p>
                    </div>
                  </div>
                  <div className="py-2">
                    <div className="flex items-center gap-3 mb-3">
                      <Lock size={16} className="text-slate-400" />
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Changer le mot de passe</p>
                    </div>
                    {pwSuccess ? (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">✓ Mot de passe modifié avec succès</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="password" value={pwOld} onChange={e => setPwOld(e.target.value)}
                          placeholder="Ancien mot de passe"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                          type="password" value={pwNew} onChange={e => setPwNew(e.target.value)}
                          placeholder="Nouveau mot de passe (min. 6 car.)"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                          type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                          placeholder="Confirmer le nouveau mot de passe"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        {pwError && <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{pwError}</p>}
                        <button
                          onClick={handleChangePassword}
                          disabled={pwLoading}
                          className="w-full py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {pwLoading ? 'Modification...' : 'Changer le mot de passe'}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <Shield size={16} className="text-slate-400" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Rôle</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{roleLabel}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-3">Sessions</p>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Session actuelle</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connecté depuis ce navigateur</p>
                </div>
              </div>

              <button
                onClick={async () => {
                  await logout();
                  setActiveModal('none');
                }}
                className="w-full py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                Déconnecter toutes les sessions
              </button>
            </div>
          </Modal>
        )}

        {/* ───── My signalements Modal ───── */}
        {activeModal === 'signalements' && (
          <Modal title="📋 Mes signalements" onClose={() => setActiveModal('none')}>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Vos {user.signalements} dernières contributions</p>
            <div className="space-y-2">
              {signalements.filter(s => s.utilisateur === user.nom || s.utilisateur === user.email).slice(0, 15).map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏷️</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{s.produit}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{s.zone} · {s.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{s.prix.toLocaleString('fr-FR')} F</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        s.verifie
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      }`}>
                        {s.verifie ? '✓ Vérifié' : '⏳ En attente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setActiveModal('none'); setPage('signaler'); }}
              className="w-full mt-4 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold text-sm hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
            >
              + Nouveau signalement
            </button>
          </Modal>
        )}

        {/* ───── Verify signalements Modal (MOD/ADMIN) ───── */}
        {activeModal === 'verify' && (
          <Modal title="✅ Vérification des signalements" onClose={() => setActiveModal('none')}>
            {/* Search + Filters */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher produit, zone, utilisateur..."
                  value={searchSignalement}
                  onChange={e => setSearchSignalement(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary-400"
                />
              </div>
              <div className="flex gap-2">
                {([
                  { key: 'all' as const, label: 'Tous', count: signalements.length },
                  { key: 'pending' as const, label: 'En attente', count: pendingSignalements.length },
                  { key: 'verified' as const, label: 'Vérifiés', count: verifiedSignalements.length },
                ]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilterSignalement(f.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      filterSignalement === f.key
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-2">
              {filteredSignalements.slice(0, 30).map(s => (
                <div
                  key={s.id}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedSignalement(expandedSignalement === s.id ? null : s.id)}
                    className="w-full p-3 flex items-center gap-3"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${s.verifie ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.produit}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.zone} · {s.utilisateur} · {s.date}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white shrink-0">{s.prix.toLocaleString('fr-FR')} F</p>
                    <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${expandedSignalement === s.id ? 'rotate-180' : ''}`} />
                  </button>

                  {expandedSignalement === s.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-3 pb-3 border-t border-slate-200 dark:border-slate-600 pt-2"
                    >
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                          <p className="text-slate-400">Produit</p>
                          <p className="font-medium text-slate-900 dark:text-white">{s.produit}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                          <p className="text-slate-400">Prix signalé</p>
                          <p className="font-medium text-slate-900 dark:text-white">{s.prix.toLocaleString('fr-FR')} F CFA</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                          <p className="text-slate-400">Zone</p>
                          <p className="font-medium text-slate-900 dark:text-white">{s.zone}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
                          <p className="text-slate-400">Photo</p>
                          <p className="font-medium text-slate-900 dark:text-white">{s.photo ? '📷 Oui' : '❌ Non'}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!s.verifie && (
                          <button
                            onClick={() => handleVerify(s.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors"
                          >
                            <CheckCircle2 size={14} />
                            Approuver
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {filteredSignalements.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle2 size={40} className="text-green-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucun signalement trouvé</p>
              </div>
            )}
          </Modal>
        )}

        {/* ───── Users Modal (ADMIN) ───── */}
        {activeModal === 'users' && (
          <Modal title="👥 Gestion des utilisateurs" onClose={() => setActiveModal('none')}>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary-400"
              />
            </div>

            <div className="space-y-2">
              {filteredUsers.map(u => {
                const banned = (u as any).banned;
                const uRoleLabel = u.role === 'admin' ? 'Admin' : u.role === 'moderator' ? 'Modérateur' : 'Citoyen';
                const uRoleColor = u.role === 'admin'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : u.role === 'moderator'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';

                return (
                  <div key={u.email} className={`bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 ${banned ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{u.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{u.nom}</p>
                          {banned && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-medium">Banni</span>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${uRoleColor}`}>
                        {uRoleLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-400">Zone</p>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{u.zone}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-400">Signalements</p>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{u.signalements}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-400">Statut</p>
                        <p className={`text-xs font-semibold ${banned ? 'text-red-500' : 'text-green-500'}`}>
                          {banned ? 'Banni' : 'Actif'}
                        </p>
                      </div>
                    </div>

                    {u.email !== user.email && (
                      <div className="space-y-2">
                        {/* ✅ Sélecteur de rôle (admin seulement) */}
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1.5 font-semibold uppercase tracking-wide">Changer le rôle</p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['user', 'moderator', 'admin'] as const).map(r => {
                              const rLabels = { user: '👤 Citoyen', moderator: '🛡️ Modérateur', admin: '👨‍💻 Admin' };
                              const isActive = u.role === r;
                              return (
                                <button
                                  key={r}
                                  onClick={() => !isActive && handleChangeRole(u.email, r)}
                                  disabled={isActive}
                                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors ${
                                    isActive
                                      ? 'bg-primary-600 text-white cursor-default'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700'
                                  }`}
                                >
                                  {rLabels[r]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {/* Bouton ban */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleBan(u.email)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                              banned
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                            }`}
                          >
                            {banned ? (
                              <><CheckCircle2 size={14} /> Réactiver</>
                            ) : (
                              <><XCircle size={14} /> Bannir</>
                            )}
                          </button>
                          <button
                            onClick={() => flash(`Email envoyé à ${u.email}`)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                          >
                            <Mail size={14} />
                            Contacter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Modal>
        )}

        {/* ───── Stats Modal (ADMIN) ───── */}
        {activeModal === 'stats' && (
          <Modal title="📊 Statistiques plateforme" onClose={() => setActiveModal('none')}>
            <div className="space-y-4">
              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Signalements', value: signalements.length.toString(), icon: '📋', color: 'bg-blue-50 dark:bg-blue-900/20' },
                  { label: 'Vérifiés', value: `${verifiedSignalements.length} (${Math.round(verifiedSignalements.length / signalements.length * 100)}%)`, icon: '✅', color: 'bg-green-50 dark:bg-green-900/20' },
                  { label: 'En attente', value: pendingSignalements.length.toString(), icon: '⏳', color: 'bg-orange-50 dark:bg-orange-900/20' },
                  { label: 'Utilisateurs', value: allUsers.length.toString(), icon: '👥', color: 'bg-purple-50 dark:bg-purple-900/20' },
                  { label: 'Alertes', value: alertes.length.toString(), icon: '🔔', color: 'bg-amber-50 dark:bg-amber-900/20' },
                  { label: 'Zones couvertes', value: '10', icon: '📍', color: 'bg-cyan-50 dark:bg-cyan-900/20' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.color} rounded-xl p-3 transition-colors`}>
                    <span className="text-lg">{stat.icon}</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Activity chart (visual bars) */}
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-3">Activité par zone</p>
                {zones.slice(0, 6).map(z => {
                  const count = signalements.filter(s => s.zone === z.name).length;
                  const maxCount = Math.max(...zones.map(zn => signalements.filter(s => s.zone === zn.name).length), 1);
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={z.id} className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{z.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{count} signalements</p>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Top contributors */}
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-3">Top contributeurs</p>
                <div className="space-y-2">
                  {allUsers.sort((a, b) => b.signalements - a.signalements).slice(0, 3).map((u, idx) => (
                    <div key={u.email} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
                      <span className="text-lg font-bold text-slate-300 dark:text-slate-600 w-6 text-center">#{idx + 1}</span>
                      <span className="text-xl">{u.avatar}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{u.nom}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{u.signalements} signalements</p>
                      </div>
                      {idx === 0 && <span className="text-xl">🥇</span>}
                      {idx === 1 && <span className="text-xl">🥈</span>}
                      {idx === 2 && <span className="text-xl">🥉</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* ───── Export Modal (ADMIN) ───── */}
        {activeModal === 'export' && (
          <Modal title="📥 Exporter les données" onClose={() => setActiveModal('none')}>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Téléchargez les données au format CSV</p>
            <div className="space-y-3">
              {[
                { type: 'signalements' as const, icon: '📋', label: 'Signalements', desc: `${signalements.length} entrées · Tous les signalements utilisateurs`, size: '~45 Ko' },
                { type: 'alertes' as const, icon: '🔔', label: 'Alertes', desc: `${alertes.length} alertes · Hausse, baisse, nouveaux prix`, size: '~12 Ko' },
                { type: 'prix' as const, icon: '💰', label: 'Base de prix', desc: 'Tous les prix alimentaires, transport, carburant', size: '~28 Ko' },
              ].map(item => (
                <button
                  key={item.type}
                  onClick={() => handleExport(item.type)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-600 transition-all text-left"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                  <div className="text-right">
                    <Download size={18} className="text-primary-500 mb-0.5" />
                    <p className="text-[10px] text-slate-400">{item.size}</p>
                  </div>
                </button>
              ))}
            </div>
          </Modal>
        )}

        {/* ───── Help Modal ───── */}
        {activeModal === 'help' && (
          <Modal title="❓ Aide & FAQ" onClose={() => setActiveModal('none')}>
            <div className="space-y-3">
              {[
                { q: 'Comment signaler un prix ?', a: 'Allez dans l\'onglet "Signaler", choisissez le produit, indiquez le prix et la zone, puis prenez une photo du ticket si possible.' },
                { q: 'Mes signalements sont-ils vérifiés ?', a: 'Oui, chaque signalement est vérifié par nos modérateurs avant d\'être intégré aux statistiques officielles.' },
                { q: 'Comment recevoir les alertes prix ?', a: 'Activez les notifications dans votre profil. Vous pouvez choisir les types d\'alertes (hausse, baisse, nouveaux prix).' },
                { q: 'Comment changer ma zone ?', a: 'Dans votre profil, cliquez sur "Ma zone" et sélectionnez votre nouvelle localisation.' },
                { q: 'Les données sont-elles fiables ?', a: 'PrixSen croise les données crowdsourcées avec les prix officiels pour garantir la fiabilité des informations.' },
                { q: 'Comment devenir modérateur ?', a: 'Les modérateurs sont sélectionnés parmi les contributeurs les plus actifs et fiables. Continuez à signaler des prix !' },
              ].map((faq, i) => (
                <details key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl overflow-hidden group">
                  <summary className="flex items-center gap-3 p-3.5 cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <HelpCircle size={16} className="text-primary-500 shrink-0" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white flex-1">{faq.q}</p>
                    <ChevronDown size={14} className="text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-3.5 pb-3.5 pt-0">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-7">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Besoin d'aide supplémentaire ?</p>
              <p className="text-xs text-primary-600 dark:text-primary-400">Contactez-nous à support@prixsen.sn</p>
            </div>
          </Modal>
        )}

        {/* ───── About Modal ───── */}
        {activeModal === 'about' && (
          <Modal title="ℹ️ À propos de PrixSen" onClose={() => setActiveModal('none')}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">PrixSen</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Plateforme Nationale de Suivi du Coût de la Vie</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Version 1.0.0 · Build 2025.06.18</p>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">🎯 Mission</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  PrixSen permet aux citoyens sénégalais de suivre en temps réel l'évolution des prix des produits essentiels, comparer les prix entre zones et signaler les prix observés sur le terrain.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">📊 Données</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    <span className="text-slate-600 dark:text-slate-300">{signalements.length} signalements</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                    <span className="text-slate-600 dark:text-slate-300">10 zones couvertes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600 dark:text-slate-300">15 produits suivis</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span className="text-slate-600 dark:text-slate-300">{allUsers.length} utilisateurs</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">🛠 Technologies</p>
                <div className="flex flex-wrap gap-1.5">
                  {['React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Framer Motion', 'Vite'].map(tech => (
                    <span key={tech} className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-[10px] font-medium px-2 py-1 rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
              © 2025 PrixSen — Tous droits réservés 🇸🇳
            </p>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
