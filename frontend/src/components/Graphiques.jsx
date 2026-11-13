import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { fmt } from '../constants';

const COULEURS = ['#0f766e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#10b981', '#ec4899', '#64748b', '#f97316'];

export default function Graphiques({ stats }) {
  const categories = stats?.parCategorie || [];
  const mois = stats?.parMois || [];

  return (
    <section className="graphiques">
      <div className="panneau">
        <h3>Dépenses par catégorie</h3>
        {categories.length === 0 ? (
          <p className="vide">Pas encore de dépenses.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categories} dataKey="total" nameKey="categorie" outerRadius={95} innerRadius={50}>
                {categories.map((_, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panneau">
        <h3>Revenus et dépenses par mois</h3>
        {mois.length === 0 ? (
          <p className="vide">Pas encore de données.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mois}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Bar dataKey="revenus" name="Revenus" fill="#0f766e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="depenses" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}