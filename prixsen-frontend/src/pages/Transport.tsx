import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { zones, formatPrix } from '../data/mockData';
import { MapPin, Loader2 } from 'lucide-react';
import { transportAPI } from '../services/api';

interface PrixTransport {
  id: string; type: string; trajet: string; prix: number; zone: string; icon: string;
}

export function Transport() {
  const [filterZone, setFilterZone] = useState('dakar');
  const [filterType, setFilterType] = useState('Tous');
  const [transports, setTransports] = useState<PrixTransport[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Charger depuis l'API
  useEffect(() => {
    setLoading(true);
    transportAPI.getPrix(filterZone).then(data => {
      if (data.success) setTransports(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filterZone]);

  const types = ['Tous', ...Array.from(new Set(transports.map(t => t.type)))];
  const filtered = transports.filter(t => filterType === 'Tous' || t.type === filterType);
  const grouped = filtered.reduce((acc, t) => {
    if (!acc[t.type]) acc[t.type] = [];
    acc[t.type].push(t);
    return acc;
  }, {} as Record<string, PrixTransport[]>);

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Prix Transport</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Tarifs des transports urbains et interurbains</p>
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
                filterType === t ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-primary-300'
              }`}>{t}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <span>{items[0]?.icon}</span> {type}
              </h2>
              <div className="space-y-2">
                {items.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{t.trajet}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.type}</p>
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{formatPrix(t.prix)}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">Aucun transport disponible pour cette zone</div>
          )}
        </div>
      )}
    </div>
  );
}
