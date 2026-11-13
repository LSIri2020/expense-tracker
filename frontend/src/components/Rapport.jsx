import { fmt } from '../constants';

const nomMois = (m) =>
  new Date(`${m}-01T00:00:00Z`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function Rapport({ parMois }) {
  const lignes = [...parMois].reverse(); // mois le plus récent en premier

  return (
    <section className="panneau">
      <div className="barre">
        <h3>Rapport mensuel</h3>
        <button className="btn btn-clair no-print" onClick={() => window.print()} disabled={lignes.length === 0}>
          Imprimer / PDF
        </button>
      </div>

      {lignes.length === 0 ? (
        <p className="vide">Le rapport apparaîtra dès votre première transaction.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mois</th>
                <th className="droite">Revenus</th>
                <th className="droite">Dépenses</th>
                <th className="droite">Solde</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => {
                const solde = l.revenus - l.depenses;
                return (
                  <tr key={l.mois}>
                    <td style={{ textTransform: 'capitalize' }}>{nomMois(l.mois)}</td>
                    <td className="droite plus">{fmt(l.revenus)}</td>
                    <td className="droite moins">{fmt(l.depenses)}</td>
                    <td className={`droite ${solde >= 0 ? 'plus' : 'moins'}`}><strong>{fmt(solde)}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}