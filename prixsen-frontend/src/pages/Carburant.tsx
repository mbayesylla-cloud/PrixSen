import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { carburantAPI } from '../services/api';
import { formatPrix } from '../data/mockData';
import { Loader2 } from 'lucide-react';

interface PrixCarburant {
  id: number; type: string; prix: number; icon: string;
  historique: { mois: string; prix: number }[];
}

export function Carburant() {
  const [carburants, setCarburants] = useState<PrixCarburant[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Charger depuis l'API
  useEffect(() => {
    carburantAPI.getPrix().then(data => {
      if (data.success) setCarburants(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={32} className="animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Prix Carburant & Énergie</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Prix officiels et évolution</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {carburants.map((c, i) => {
          const first = c.historique[0]?.prix;
          const last = c.historique[c.historique.length - 1]?.prix;
          const change = first && last ? ((last - first) / first * 100).toFixed(1) : '0.0';

          return (
            <motion.div key={c.type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{c.icon}</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{c.type}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrix(c.prix)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">par litre / unité</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={12} className="text-danger-500" />
                <span className="text-xs font-medium text-danger-500">+{change}%</span>
                <span className="text-xs text-slate-400">/ 6 mois</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {carburants.map((c, i) => (
        c.historique.length > 0 && (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span>{c.icon}</span>
              <h2 className="font-semibold text-sm text-slate-900 dark:text-white">{c.type} — Évolution 6 mois</h2>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={c.historique}>
                  <defs>
                    <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(v: any) => [formatPrix(v), 'Prix']} />
                  <Area type="monotone" dataKey="prix" stroke="#3b82f6" strokeWidth={2} fill={`url(#grad${i})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )
      ))}
    </div>
  );
}
