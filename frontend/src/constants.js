export const CATEGORIES_DEPENSE = [
  'Alimentation', 'Transport', 'Logement', 'Loisirs', 'Santé',
  'Éducation', 'Shopping', 'Factures', 'Autre',
];
export const CATEGORIES_REVENU = ['Salaire', 'Freelance', 'Cadeau', 'Investissement', 'Autre'];

export const fmt = (n) =>
  Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DT';