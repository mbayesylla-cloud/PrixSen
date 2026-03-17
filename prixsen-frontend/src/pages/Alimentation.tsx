import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { zones, formatPrix } from '../data/mockData';
import { Search, MapPin, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { alimentationAPI } from '../services/api';

interface Produit {
  id: string; nom: string; unite: string; icon: string; categorie: string;
  prix: number; prix_moyen_national: number;
  prixParZone: Record<string, number>;
  historique: { mois: string; prix: number }[];
}

function getPrixMoyenNational(p: Produit): number {
  const vals = Object.values(p.prixParZone);
  if (vals.length === 0) return p.prix_moyen_national || p.prix;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}
function getZoneMoinsChere(p: Produit): string {
  const entries = Object.entries(p.prixParZone);
  if (!entries.length) return '-';
  entries.sort((a, b) => a[1] - b[1]);
  return zones.find(z => z.id === entries[0][0])?.name || entries[0][0];
}
function getZonePlusChere(p: Produit): string {
  const entries = Object.entries(p.prixParZone);
  if (!entries.length) return '-';
  entries.sort((a, b) => b[1] - a[1]);
  return zones.find(z => z.id === entries[0][0])?.name || entries[0][0];
}

export function Alimentation() {
  const { selectedZone, setSelectedZone } = useStore();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState('Tous');
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Charger depuis l'API
  useEffect(() => {
    setLoading(true);
    alimentationAPI.getProduits(selectedZone).then(data => {
      if (data.success) setProduits(data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedZone]);

  const categories = ['Tous', ...Array.from(new Set(produits.map(p => p.categorie)))];
  const filtered = produits.filter(p => {
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'Tous' || p.categorie === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Prix Alimentaires</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Suivez les prix des produits de base</p>
      </div>

      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterCat === cat ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-primary-300'
              }`}>{cat}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary-500" />
          <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}
            className="text-sm font-medium text-primary-700 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-300 border border-primary-200 dark:border-primary-700 rounded-lg px-2 py-1.5 focus:outline-none">
            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p, i) => {
            const isExpanded = expandedId === p.id;
            const prixZone = p.prixParZone[selectedZone] || p.prix;
            const prixNat = getPrixMoyenNational(p);
            const diff = prixNat > 0 ? ((prixZone - prixNat) / prixNat * 100) : 0;

            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <button onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.nom}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{p.categorie}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-slate-900 dark:text-white">{formatPrix(prixZone)}</p>
                    <div className={`flex items-center gap-0.5 text-xs justify-end ${diff > 0 ? 'text-danger-500' : diff < 0 ? 'text-accent-500' : 'text-slate-400'}`}>
                      {diff > 0 ? <TrendingUp size={10} /> : diff < 0 ? <TrendingDown size={10} /> : null}
                      <span>{diff > 0 ? '+' : ''}{diff.toFixed(1)}% vs nat.</span>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="pt-3 grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Moy. nationale</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{formatPrix(prixNat)}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Moins cher</p>
                        <p className="text-xs font-bold text-green-700 dark:text-green-400">{getZoneMoinsChere(p)}</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Plus cher</p>
                        <p className="text-xs font-bold text-red-700 dark:text-red-400">{getZonePlusChere(p)}</p>
                      </div>
                    </div>
                    {p.historique.length > 0 && (
                      <div className="h-32">
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Évolution 6 mois</p>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={p.historique}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                              formatter={(v: any) => [formatPrix(v), 'Prix']} />
                            <Line type="monotone" dataKey="prix" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400 text-sm">Aucun produit trouvé</div>
          )}
        </div>
      )}
    </div>
  );
}
