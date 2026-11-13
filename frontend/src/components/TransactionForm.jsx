import { useState } from 'react';
import { CATEGORIES_DEPENSE, CATEGORIES_REVENU } from '../constants';

export default function TransactionForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(() =>
    initial
      ? {
          type: initial.type,
          montant: String(initial.montant),
          categorie: initial.categorie,
          description: initial.description || '',
          date: initial.date.slice(0, 10),
        }
      : {
          type: 'expense',
          montant: '',
          categorie: CATEGORIES_DEPENSE[0],
          description: '',
          date: new Date().toISOString().slice(0, 10),
        }
  );
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const base = f.type === 'income' ? CATEGORIES_REVENU : CATEGORIES_DEPENSE;
  const options = base.includes(f.categorie) ? base : [f.categorie, ...base];

  const changerType = (type) => {
    const liste = type === 'income' ? CATEGORIES_REVENU : CATEGORIES_DEPENSE;
    setF({ ...f, type, categorie: liste[0] });
  };
  const maj = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const soumettre = async (e) => {
    e.preventDefault();
    const montant = parseFloat(String(f.montant).replace(',', '.'));
    if (!(montant > 0)) return setErreur('Le montant doit être un nombre positif.');
    if (!f.date) return setErreur('La date est obligatoire.');

    setErreur('');
    setEnvoi(true);
    try {
      await onSave({ ...f, montant });
    } catch (err) {
      setErreur(err.message);
      setEnvoi(false);
    }
  };

  return (
    <div className="fond-modal" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={soumettre} noValidate>
        <h2>{initial ? 'Modifier la transaction' : 'Nouvelle transaction'}</h2>

        {erreur && <div className="alerte" role="alert">{erreur}</div>}

        <div className="bascule">
          <button type="button" className={f.type === 'expense' ? 'actif moins-bg' : ''} onClick={() => changerType('expense')}>
            Dépense
          </button>
          <button type="button" className={f.type === 'income' ? 'actif plus-bg' : ''} onClick={() => changerType('income')}>
            Revenu
          </button>
        </div>

        <label>
          Montant (DT)
          <input name="montant" inputMode="decimal" value={f.montant} onChange={maj} placeholder="0,00" autoFocus />
        </label>

        <label>
          Catégorie
          <select name="categorie" value={f.categorie} onChange={maj}>
            {options.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>

        <label>
          Description (facultatif)
          <input name="description" value={f.description} onChange={maj} maxLength={100} />
        </label>

        <label>
          Date
          <input name="date" type="date" value={f.date} onChange={maj} />
        </label>

        <div className="boutons">
          <button type="button" className="btn btn-clair" onClick={onCancel}>Annuler</button>
          <button className="btn" disabled={envoi}>{envoi ? 'Patientez…' : 'Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
}