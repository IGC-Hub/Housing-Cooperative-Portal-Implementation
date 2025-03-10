import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Documents } from './pages/Documents';
import { Tasks } from './pages/Tasks';
import { Calendar } from './pages/Calendar';
import { Login } from './pages/Login';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';

// Composant qui vérifie si l'utilisateur est connecté
const ProtectedRoute = ({ element }) => {
  const { user } = useAuthStore();
  
  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Sinon, afficher le composant demandé
  return element;
};

function App() {
  const { user, setUser } = useAuthStore();
  
  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement de la page
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
    };
    
    checkUser();
    
    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser]);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route 
          path="/" 
          element={<ProtectedRoute element={<Layout><Dashboard /></Layout>} />} 
        />
        <Route 
          path="/documents" 
          element={<ProtectedRoute element={<Layout><Documents /></Layout>} />} 
        />
        <Route 
          path="/tasks" 
          element={<ProtectedRoute element={<Layout><Tasks /></Layout>} />} 
        />
        <Route 
          path="/calendar" 
          element={<ProtectedRoute element={<Layout><Calendar /></Layout>} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;