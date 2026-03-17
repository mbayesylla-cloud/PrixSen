import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { zones, formatPrix } from '../data/mockData';
import { TrendingUp, TrendingDown, ShoppingCart, Fuel, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { dashboardAPI, analyseAPI } from '../services/api';

interface DashStats {
  utilisateurs: number; signalements: number;
  signalementsVerifies: number; alertes: number;
}

export function Dashboard() {
  const { user, setPage, alertes, signalements, selectedZone, setSelectedZone, loadAlertes, loadSignalements } = useStore();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [evolutionData, setEvolutionData] = useState<{ mois: string; index: number }[]>([]);

  const unreadAlertes = alertes.filter(a => !a.lue).length;

  // ✅ Charger stats depuis l'API
  useEffect(() => {
    // Stats dashboard
    dashboardAPI.get().then(data => {
      if (data.success) setStats(data.data.stats);
      setLoading(false);
    }).catch(() => { setLoading(false); });

    // Courbe d'évolution depuis les vraies données d'inflation
    analyseAPI.get().then(data => {
      if (data.success && data.data.inflationData?.length > 0) {
        // Convertir l'inflation générale en indice base 100
        const items = data.data.inflationData as { mois: string; general: number }[];
        setEvolutionData(items.map(d => ({ mois: d.mois, index: parseFloat((100 + d.general).toFixed(1)) })));
      }
    }).catch(() => {});

    // S'assurer que les alertes et signalements sont chargés
    if (alertes.length === 0) loadAlertes();
    if (signalements.length === 0) loadSignalements();
  }, []);

  const quickStats = [
    { label: 'Signalements', value: stats?.signalements?.toString() ?? '...', icon: ShoppingCart, color: 'bg-blue-500', change: `${stats?.signalementsVerifies ?? 0} vérifiés` },
    { label: 'Utilisateurs', value: stats?.utilisateurs?.toString() ?? '...', icon: Fuel, color: 'bg-orange-500', change: 'inscrits' },
    { label: 'En attente', value: stats ? (stats.signalements - stats.signalementsVerifies).toString() : '...', icon: AlertTriangle, color: 'bg-amber-500', change: 'à vérifier' },
    { label: 'Alertes actives', value: unreadAlertes.toString(), icon: TrendingUp, color: 'bg-red-500', change: 'non lues' },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Bonjour, {user?.nom?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Voici l'aperçu du coût de la vie au Sénégal</p>
      </div>

      <div className="mb-4">
        <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
          {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
      </div>

      {/* Quick stats depuis l'API */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {quickStats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon size={16} className="text-white" />
              </div>
              <span className="text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 px-1.5 py-0.5 rounded">{s.change}</span>
            </div>
            {loading ? <div className="w-12 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" /> : <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>}
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Evolution chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white">Indice du coût de la vie</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Évolution sur 6 mois (base 100 = Jan)</p>
          </div>
          {evolutionData.length >= 2 && (() => {
            const first = evolutionData[0].index;
            const last = evolutionData[evolutionData.length - 1].index;
            const diff = (last - first).toFixed(1);
            const up = last >= first;
            return (
              <div className={`flex items-center gap-1 text-sm font-medium ${up ? 'text-danger-500' : 'text-accent-500'}`}>
                {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{up ? '+' : ''}{diff}%</span>
              </div>
            );
          })()}
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolutionData}>
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[99, 107]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(value) => [Number(value).toFixed(1), 'Indice']} />
              <Area type="monotone" dataKey="index" stroke="#3b82f6" strokeWidth={2} fill="url(#gradBlue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Signalements récents */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white">Signalements récents</h2>
            <button onClick={() => setPage('signaler')} className="text-xs text-primary-600 font-medium flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2.5">
            {signalements.slice(0, 5).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Aucun signalement</p>
            ) : (
              signalements.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${s.verifie ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {s.verifie ? '✓' : '⏳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.produit}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.zone}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatPrix(s.prix)}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Alertes récentes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white">Alertes récentes</h2>
            <button onClick={() => setPage('alertes')} className="text-xs text-primary-600 font-medium flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2.5">
            {alertes.slice(0, 5).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Aucune alerte</p>
            ) : (
              alertes.slice(0, 5).map(a => (
                <div key={a.id} className={`flex items-start gap-3 p-2 rounded-lg ${!a.lue ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}>
                  <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    a.type === 'hausse' ? 'bg-red-100 text-red-600' : a.type === 'baisse' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>{a.type === 'hausse' ? '↑' : a.type === 'baisse' ? '↓' : '★'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 dark:text-white">{a.message}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{a.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'alimentation', icon: '🛒', label: 'Alimentation', color: 'from-blue-50 to-blue-100 border-blue-200' },
          { id: 'transport', icon: '🚕', label: 'Transport', color: 'from-green-50 to-green-100 border-green-200' },
          { id: 'carburant', icon: '⛽', label: 'Carburant', color: 'from-orange-50 to-orange-100 border-orange-200' },
          { id: 'logement', icon: '🏠', label: 'Logement', color: 'from-purple-50 to-purple-100 border-purple-200' },
        ].map(item => (
          <button key={item.id} onClick={() => setPage(item.id)}
            className={`p-4 rounded-xl border bg-gradient-to-br ${item.color} hover:shadow-md transition-shadow text-center`}>
            <span className="text-2xl">{item.icon}</span>
            <p className="text-sm font-semibold text-slate-700 mt-2">{item.label}</p>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
