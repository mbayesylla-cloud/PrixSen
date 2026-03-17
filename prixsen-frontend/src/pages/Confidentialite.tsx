import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export function Confidentialite() {
  const { setPage } = useStore();
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Politique de confidentialité</h1>
        <button onClick={() => setPage('inscription')} className="text-sm text-primary-600">← Retour</button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 text-sm text-slate-700">
        <p>Dernière mise à jour: 18 juin 2025</p>
        <p>Chez PrixSen, nous nous engageons à protéger votre vie privée. Cette politique explique quelles informations nous collectons, comment nous les utilisons et vos droits.</p>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">1. Données collectées</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Données de compte: nom, email, zone.</li>
            <li>Données d'usage: pages visitées, interactions.</li>
            <li>Données de contenu: prix signalés, photos de tickets (si soumis).</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">2. Utilisation des données</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fournir la plateforme et ses fonctionnalités.</li>
            <li>Améliorer la qualité des données et détecter les abus.</li>
            <li>Envoyer des alertes et notifications si vous l'avez activé.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">3. Partage des données</h2>
          <p>Nous ne vendons pas vos données. Nous pouvons partager des statistiques agrégées anonymisées avec des partenaires publics.</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">4. Conservation</h2>
          <p>Les données sont conservées le temps nécessaire à la fourniture du service, puis supprimées ou anonymisées.</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">5. Vos droits</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Accès, rectification, suppression de vos données.</li>
            <li>Opposition au traitement et retrait du consentement.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">6. Contact</h2>
          <p>Pour toute question: privacy@prixsen.sn</p>
        </div>
      </motion.div>
    </div>
  );
}
