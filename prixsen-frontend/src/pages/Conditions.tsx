import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export function Conditions() {
  const { setPage } = useStore();
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Conditions d'utilisation</h1>
        <button onClick={() => setPage('inscription')} className="text-sm text-primary-600">← Retour</button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 text-sm text-slate-700">
        <p>Dernière mise à jour: 18 juin 2025</p>
        <p>En utilisant PrixSen, vous acceptez les conditions suivantes.</p>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">1. Objet</h2>
          <p>PrixSen fournit des informations sur les prix à des fins d'information. Nous ne garantissons pas l'exactitude des prix en tout temps.</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">2. Compte utilisateur</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vous êtes responsable de la confidentialité de vos identifiants.</li>
            <li>Vous ne devez pas soumettre de contenus frauduleux ou illégaux.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">3. Contenu utilisateur</h2>
          <p>Vous conservez vos droits sur le contenu soumis. Vous accordez à PrixSen une licence pour l'utiliser aux fins de la plateforme.</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">4. Limitation de responsabilité</h2>
          <p>PrixSen n'est pas responsable des pertes liées à l'utilisation des données affichées.</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">5. Résiliation</h2>
          <p>Nous pouvons suspendre ou résilier un compte en cas d'abus.</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">6. Modifications</h2>
          <p>Nous pouvons modifier ces conditions. La version à jour sera disponible sur cette page.</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-1">7. Contact</h2>
          <p>Pour toute question: legal@prixsen.sn</p>
        </div>
      </motion.div>
    </div>
  );
}
