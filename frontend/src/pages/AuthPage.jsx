import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage({ mode }) {
  const inscription = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nom: '', email: '', password: '' });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const maj = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const valider = () => {
    if (inscription && form.nom.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères.';
    if (!regexEmail.test(form.email.trim())) return 'Adresse email invalide.';
    if (form.password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
    return '';
  };

  const soumettre = async (e) => {
    e.preventDefault();
    const probleme = valider();
    if (probleme) return setErreur(probleme);

    setErreur('');
    setEnvoi(true);
    try {
      if (inscription) await register(form.nom.trim(), form.email.trim(), form.password);
      else await login(form.email.trim(), form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <main className="auth">
      <form className="carte" onSubmit={soumettre} noValidate>
        <h1>💰 Expense Tracker</h1>
        <p className="sous-titre">
          {inscription ? 'Créez votre compte' : 'Connectez-vous à votre compte'}
        </p>

        {erreur && <div className="alerte" role="alert">{erreur}</div>}

        {inscription && (
          <label>
            Nom
            <input name="nom" value={form.nom} onChange={maj} autoComplete="name" />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={maj} autoComplete="email" />
        </label>
        <label>
          Mot de passe
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={maj}
            autoComplete={inscription ? 'new-password' : 'current-password'}
          />
        </label>

        <button className="btn" disabled={envoi}>
          {envoi ? 'Patientez…' : inscription ? "S'inscrire" : 'Se connecter'}
        </button>

        <p className="lien">
          {inscription ? (
            <>Déjà un compte ? <Link to="/login">Se connecter</Link></>
          ) : (
            <>Pas de compte ? <Link to="/register">S'inscrire</Link></>
          )}
        </p>
      </form>
    </main>
  );
}