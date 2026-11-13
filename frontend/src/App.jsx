import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

// Page réservée aux utilisateurs connectés
function Protege({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="centre">Chargement…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

// Page réservée aux visiteurs (connexion, inscription)
function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="centre">Chargement…</p>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Protege><Dashboard /></Protege>} />
      <Route path="/login" element={<Public><AuthPage mode="login" /></Public>} />
      <Route path="/register" element={<Public><AuthPage mode="register" /></Public>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}