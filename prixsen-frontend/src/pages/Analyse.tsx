import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { formatPrix } from '../data/mockData';
import { TrendingUp, TrendingDown, AlertTriangle, Loader2 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { alimentationAPI, carburantAPI } from '../services/api';

interface Produit {
  id: string; nom: string; icon: string; prix_moyen_national: number;
  historique: { mois: string; prix: number }[];
  prixParZone: Record<string, number>;
}
interface Carburant { id: number; type: string; prix: number; }

function getPrixMoyen(p: Produit): number {
  const vals = Object.values(p.prixParZone);
  if (vals.length) return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  return p.prix_moyen_national;
}

export function Analyse() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [carburants, setCarburants] = useState<Carburant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      alimentationAPI.getProduits(),
      carburantAPI.getPrix(),
    ]).then(([alimData, carbData]) => {
      if (alimData.success) setProduits(alimData.data);
      if (carbData.success) setCarburants(carbData.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const inflationData = [
    { mois: 'Jan', alimentaire: 2.1, transport: 1.5, logement: 1.8, general: 1.9 },
    { mois: 'Fév', alimentaire: 2.4, transport: 1.6, logement: 1.9, general: 2.1 },
    { mois: 'Mar', alimentaire: 3.1, transport: 2.0, logement: 2.0, general: 2.5 },
    { mois: 'Avr', alimentaire: 3.5, transport: 2.2, logement: 2.1, general: 2.8 },
    { mois: 'Mai', alimentaire: 4.2, transport: 2.5, logement: 2.3, general: 3.2 },
    { mois: 'Jun', alimentaire: 4.8, transport: 2.8, logement: 2.4, general: 3.5 },
  ];

  const topProduits = [...produits]
    .map(p => ({ nom: p.nom.replace(/ \(.*\)/, ''), prix: getPrixMoyen(p), icon: p.icon }))
    .sort((a, b) => b.prix - a.prix).slice(0, 8);

  const keyProducts = produits.slice(0, 4);
  const evolutionData = keyProducts.length > 0
    ? keyProducts[0].historique.map((h, i) => {
        const row: Record<string, string | number> = { mois: h.mois };
        keyProducts.forEach(p => { row[p.nom.replace(/ \(.*\)/, '')] = p.historique[i]?.prix || 0; });
        return row;
      })
    : [];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const panierTotal = produits.slice(0, 8).reduce((acc, p) => acc + getPrixMoyen(p), 0);
  const essencePrice = carburants.find(c => c.type.toLowerCase().includes('super'))?.prix || 0;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={32} className="animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analyse & Tendances</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Vue d'ensemble de l'inflation et des prix</p>
      </div>

      {/* Key indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Inflation alim.', value: '+4.8%', icon: TrendingUp, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-red-900/20' },
          { label: 'Inflation générale', value: '+3.5%', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Panier moyen', value: formatPrix(panierTotal), icon: AlertTriangle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Carburant super', value: essencePrice ? formatPrix(essencePrice) : '...', icon: TrendingDown, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-green-900/20' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`${s.bg} rounded-xl p-3 border border-transparent`}>
            <s.icon size={18} className={`${s.color} mb-1`} />
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Inflation multi-secteurs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm mb-6">
        <h2 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Inflation par secteur (%)</h2>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={inflationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                formatter={(v: any) => [`${v}%`]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="alimentaire" stroke="#ef4444" strokeWidth={2} dot={false} name="Alimentaire" />
              <Line type="monotone" dataKey="transport" stroke="#3b82f6" strokeWidth={2} dot={false} name="Transport" />
              <Line type="monotone" dataKey="logement" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Logement" />
              <Line type="monotone" dataKey="general" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Général" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top produits */}
      {topProduits.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm mb-6">
          <h2 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Prix moyen national des produits</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProduits} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nom" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  formatter={(v: any) => [formatPrix(v), 'Prix']} />
                <Bar dataKey="prix" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Évolution produits clés */}
      {evolutionData.length > 0 && keyProducts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h2 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Évolution des produits clés (6 mois)</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  formatter={(v: any) => [formatPrix(v)]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                {keyProducts.map((p, i) => (
                  <Line key={p.id} type="monotone" dataKey={p.nom.replace(/ \(.*\)/, '')} stroke={colors[i]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
