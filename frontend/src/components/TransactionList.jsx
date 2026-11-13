import { fmt } from '../constants';

export default function TransactionList({ liste, onEdit, onDelete }) {
  if (liste.length === 0) {
    return <p className="vide">Aucune transaction. Cliquez sur « + Ajouter » pour commencer.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Catégorie</th>
            <th>Description</th>
            <th className="droite">Montant</th>
            <th className="no-print"></th>
          </tr>
        </thead>
        <tbody>
          {liste.map((t) => (
            <tr key={t._id}>
              <td>{new Date(t.date).toLocaleDateString('fr-FR', { timeZone: 'UTC' })}</td>
              <td><span className={`pastille ${t.type}`}>{t.categorie}</span></td>
              <td>{t.description || '—'}</td>
              <td className={`droite ${t.type === 'income' ? 'plus' : 'moins'}`}>
                {t.type === 'income' ? '+' : '−'} {fmt(t.montant)}
              </td>
              <td className="actions no-print">
                <button className="lien-btn" onClick={() => onEdit(t)}>Modifier</button>
                <button className="lien-btn danger" onClick={() => onDelete(t)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}