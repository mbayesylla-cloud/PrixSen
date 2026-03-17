import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Bell, TrendingUp, TrendingDown, Star, CheckCheck } from 'lucide-react';

type Filter = 'Toutes' | 'hausse' | 'baisse' | 'nouveau';

export function Alertes() {
  const { alertes, markAlertRead, markAllAlertsRead, loadAlertes } = useStore();
  const [filter, setFilter] = useState<Filter>('Toutes');

  // ✅ Charger les alertes depuis l'API au montage
  useEffect(() => {
    loadAlertes();
  }, []);

  const filtered = filter === 'Toutes' ? alertes : alertes.filter(a => a.type === filter);
  const unreadCount = alertes.filter(a => !a.lue).length;

  // ✅ markAlertRead est async
  const handleMarkRead = async (id: string) => {
    await markAlertRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAlertsRead();
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Alertes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="text-xs text-primary-600 font-medium px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors">
              Tout marquer lu
            </button>
          )}
          <Bell size={20} className="text-primary-500" />
          {unreadCount > 0 && (
            <span className="w-6 h-6 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(['Toutes', 'hausse', 'baisse', 'nouveau'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-primary-300'
            }`}>
            {f === 'Toutes' ? 'Toutes' : f === 'hausse' ? '↑ Hausse' : f === 'baisse' ? '↓ Baisse' : '★ Nouveau'}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-2">
        {filtered.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
            onClick={() => handleMarkRead(a.id)}
            className={`bg-white dark:bg-slate-800 rounded-xl p-4 border shadow-sm cursor-pointer transition-all hover:shadow-md ${
              !a.lue ? 'border-primary-200 bg-primary-50/30 dark:border-primary-700 dark:bg-primary-900/10' : 'border-slate-100 dark:border-slate-700'
            }`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                a.type === 'hausse' ? 'bg-red-100 dark:bg-red-900/30' :
                a.type === 'baisse' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {a.type === 'hausse' ? <TrendingUp size={18} className="text-red-500" /> :
                 a.type === 'baisse' ? <TrendingDown size={18} className="text-green-500" /> :
                 <Star size={18} className="text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    a.type === 'hausse' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    a.type === 'baisse' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {a.type === 'hausse' ? '↑ Hausse' : a.type === 'baisse' ? '↓ Baisse' : '★ Nouveau'}
                  </span>
                  {!a.lue && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{a.message}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-400">{a.date}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{a.zone}</span>
                </div>
              </div>
              {a.lue && <CheckCheck size={16} className="text-slate-300 dark:text-slate-600 shrink-0 mt-1" />}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Bell size={48} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Aucune alerte pour le moment</p>
        </div>
      )}
    </div>
  );
}
