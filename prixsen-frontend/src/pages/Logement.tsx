import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { zones, formatPrix } from '../data/mockData';
import { MapPin, Loader2 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { logementAPI } from '../services/api';

interface PrixLogement {
  id: number; type: string; zone_id: string; zone_nom: string; prix_moyen: number;
  historique: { mois: string; prix: number }[];
}

export function Logement() {
  const [filterZone, setFilterZone] = useState('dakar');
  const [filterType, setFilterType] = useState('Tous');
  const [logements, setLogements] = useState<PrixLogement[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Charger depuis l'API
  useEffect(() => {
    setLoading(true);
    logementAPI.getPrix(filterZone).then(data => {
      if (data.success) setLogements(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filterZone]);

  const types = ['Tous', ...Array.from(new Set(logements.map(l => l.type)))];
  const filtered = logements.filter(l => filterType === 'Tous' || l.type === filterType);

  const compType = filterType === 'Tous' ? 'Studio' : filterType;
  const compData = zones.map(z => {
    const found = logements.find(l => l.zone_id === z.id && l.type === compType);
    return found ? { zone: z.name.substring(0, 8), prix: found.prix_moyen } : null;
  }).filter(Boolean) as { zone: string; prix: number }[];

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Prix Logement</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Loyers moyens par zone et type</p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary-500" />
          <select value={filterZone} onChange={e => setFilterZone(e.target.value)}
            className="text-sm font-medium text-primary-700 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-300 border border-primary-200 dark:border-primary-700 rounded-lg px-2 py-1.5 focus:outline-none">
            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {types.map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterType === t ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
              }`}>{t}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {filtered.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏠</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{l.type}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{l.zone_nom}</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatPrix(l.prix_moyen)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">/ mois</p>
              </motion.div>
            ))}
          </div>

          {compData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
              <h2 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">
                Comparaison {compType} par zone
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="zone" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                      formatter={(v: any) => [formatPrix(v), 'Loyer']} />
                    <Bar dataKey="prix" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
