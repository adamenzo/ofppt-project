import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Intervenants from './pages/Intervenants';
import Formations from './pages/Formations';
import Planifications from './pages/Planifications';
import Statistiques from './pages/Statistiques';
import EntrepriseOffre from './pages/EntrepriseOffre';
import EntrepriseDemandes from './pages/EntrepriseDemandes';
import EntrepriseNotifications from './pages/EntrepriseNotifications';
import IntervenantFormations from './pages/IntervenantFormations';
import IntervenantCalendrier from './pages/IntervenantCalendrier';
import IntervenantNotifications from './pages/IntervenantNotifications';
import './App.css';

const STORAGE_KEY = 'ofppt_last_tab';

const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Charger l'onglet sauvegardé après l'authentification
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && isValidTab(saved, user.role)) {
        setActiveTab(saved);
      }
    }
  }, [user]);

  const isValidTab = (tab, role) => {
    const roleTabs = {
      admin_central: ['dashboard', 'intervenants', 'formations', 'planifications', 'statistiques'],
      gestionnaire_regional: ['dashboard', 'planifications', 'statistiques'],
      gestionnaire_local: ['dashboard', 'planifications'],
      entreprise: ['offre', 'mes-demandes', 'notifications'],
      intervenant: ['mes-affectations', 'calendrier', 'notifications'],
    };
    return roleTabs[role]?.includes(tab) || false;
  };

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem(STORAGE_KEY, tab);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>;

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #0090D0, #0077a8)', padding: '20px' }}>
        <Login />
      </div>
    );
  }

  const role = user?.role;

  const renderPage = () => {
    if (role === 'admin_central') {
      switch (activeTab) {
        case 'dashboard': return <Dashboard setActiveTab={handleSetActiveTab} />;
        case 'intervenants': return <Intervenants />;
        case 'formations': return <Formations />;
        case 'planifications': return <Planifications />;
        case 'statistiques': return <Statistiques />;
        default: return <Dashboard setActiveTab={handleSetActiveTab} />;
      }
    }
    if (role === 'gestionnaire_regional') {
      switch (activeTab) {
        case 'dashboard': return <Dashboard setActiveTab={handleSetActiveTab} />;
        case 'planifications': return <Planifications />;
        case 'statistiques': return <Statistiques />;
        default: return <Dashboard setActiveTab={handleSetActiveTab} />;
      }
    }
    if (role === 'gestionnaire_local') {
      switch (activeTab) {
        case 'dashboard': return <Dashboard setActiveTab={handleSetActiveTab} />;
        case 'planifications': return <Planifications />;
        default: return <Dashboard setActiveTab={handleSetActiveTab} />;
      }
    }
    if (role === 'entreprise') {
      switch (activeTab) {
        case 'offre': return <EntrepriseOffre setActiveTab={handleSetActiveTab} />;
        case 'mes-demandes': return <EntrepriseDemandes />;
        case 'notifications': return <EntrepriseNotifications />;
        default: return <EntrepriseOffre setActiveTab={handleSetActiveTab} />;
      }
    }
    if (role === 'intervenant') {
      switch (activeTab) {
        case 'mes-affectations': return <IntervenantFormations />;
        case 'calendrier': return <IntervenantCalendrier />;
        case 'notifications': return <IntervenantNotifications />;
        default: return <IntervenantFormations />;
      }
    }
    return <Dashboard setActiveTab={handleSetActiveTab} />;
  };

  return (
    <div>
      <Header activeTab={activeTab} setActiveTab={handleSetActiveTab} />
      <main>{renderPage()}</main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;