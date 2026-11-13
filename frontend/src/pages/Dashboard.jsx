import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { CATEGORIES_DEPENSE, CATEGORIES_REVENU, fmt } from '../constants';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Graphiques from '../components/Graphiques';
import Rapport from '../components/Rapport';

const FILTRES_VIDES = { type: '', categorie: '', search: '', from: '', to: '' };
const TOUTES_CATEGORIES = [...new Set([...CATEGORIES_REVENU, ...CATEGORIES_DEPENSE])];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [liste, setListe] = useState([]);
  const [stats, setStats] = useState(null);
  const [filtres, setFiltres] = useState(FILTRES_VIDES);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [formulaire, setFormulaire] = useState(null); // null = fermé, {} = ajout, objet = modification

  const charger = useCallback(async () => {
    const params = new URLSearchParams();
    Object.entries(filtres).forEach(([k, v]) => { if (v) params.set(k, v); });
    try {
      const [l, s] = await Promise.all([
        api('/transactions?' + params.toString()),
        api('/transactions/stats'),
      ]);
      setListe(l);
      setStats(s);
      setErreur('');
    } catch (e) {
      if (e.status === 401) logout();
      else setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }, [filtres, logout]);

  // Recharge quand les filtres changent (petit délai pour la recherche)
  useEffect(() => {
    const t = setTimeout(charger, filtres.search ? 300 : 0);
    return () => clearTimeout(t);
  }, [charger, filtres.search]);

  const changerFiltre = (e) => setFiltres({ ...filtres, [e.target.name]: e.target.value });

  const enregistrer = async (data) => {
    if (formulaire && formulaire._id) {
      await api(`/transactions/${formulaire._id}`, { method: 'PUT', body: data });
    } else {
      await api('/transactions', { method: 'POST', body: data });
    }
    setFormulaire(null);
    await charger();
  };

  const supprimer = async (t) => {
    if (!window.confirm(`Supprimer « ${t.categorie} – ${fmt(t.montant)} » ?`)) return;
    try {
      await api(`/transactions/${t._id}`, { method: 'DELETE' });
      await charger();
    } catch (e) {
      setErreur(e.message);
    }
  };

  const exporterCSV = () => {
    const lignes = [['Date', 'Type', 'Catégorie', 'Description', 'Montant']];
    liste.forEach((t) =>
      lignes.push([
        t.date.slice(0, 10),
        t.type === 'income' ? 'Revenu' : 'Dépense',
        t.categorie,
        t.description || '',
        String(t.montant).replace('.', ','),
      ])
    );
    const csv = lignes.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const solde = stats?.solde || 0;
  const filtresActifs = Object.values(filtres).some(Boolean);

  return (
    <>
      <header className="entete no-print">
        <strong>💰 Expense Tracker</strong>
        <div>
          <span className="bonjour">Bonjour, {user.nom}</span>
          <button className="btn btn-clair" onClick={logout}>Déconnexion</button>
        </div>
      </header>

      <main className="contenu">
        {erreur && <div className="alerte" role="alert">{erreur}</div>}

        <section className="cartes">
          <div className="stat">
            <span>Revenus</span>
            <strong className="plus">{fmt(stats?.revenus)}</strong>
          </div>
          <div className="stat">
            <span>Dépenses</span>
            <strong className="moins">{fmt(stats?.depenses)}</strong>
          </div>
          <div className="stat">
            <span>Solde</span>
            <strong className={solde >= 0 ? 'plus' : 'moins'}>{fmt(solde)}</strong>
          </div>
        </section>

        <Graphiques stats={stats} />

        <section className="panneau">
          <div className="barre no-print">
            <h3>Transactions</h3>
            <div className="barre-actions">
              <button className="btn btn-clair" onClick={exporterCSV} disabled={liste.length === 0}>
                Exporter CSV
              </button>
              <button className="btn" onClick={() => setFormulaire({})}>+ Ajouter</button>
            </div>
          </div>

          <div className="filtres no-print">
            <input name="search" placeholder="Rechercher…" value={filtres.search} onChange={changerFiltre} />
            <select name="type" value={filtres.type} onChange={changerFiltre}>
              <option value="">Tous les types</option>
              <option value="income">Revenus</option>
              <option value="expense">Dépenses</option>
            </select>
            <select name="categorie" value={filtres.categorie} onChange={changerFiltre}>
              <option value="">Toutes les catégories</option>
              {TOUTES_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input name="from" type="date" value={filtres.from} onChange={changerFiltre} aria-label="Du" />
            <input name="to" type="date" value={filtres.to} onChange={changerFiltre} aria-label="Au" />
            {filtresActifs && (
              <button className="lien-btn" onClick={() => setFiltres(FILTRES_VIDES)}>Réinitialiser</button>
            )}
          </div>

          {chargement ? (
            <p className="vide">Chargement… (le serveur peut mettre 30 à 60 s à démarrer)</p>
          ) : (
            <TransactionList liste={liste} onEdit={setFormulaire} onDelete={supprimer} />
          )}
        </section>

        <Rapport parMois={stats?.parMois || []} />
      </main>

      {formulaire && (
        <TransactionForm
          initial={formulaire._id ? formulaire : null}
          onSave={enregistrer}
          onCancel={() => setFormulaire(null)}
        />
      )}
    </>
  );
}