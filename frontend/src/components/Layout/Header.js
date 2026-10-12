import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchNotifCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setNotifCount(data.unread_count || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const getMenuItems = () => {
    const role = user?.role;
    if (role === 'admin_central') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
        { id: 'intervenants', label: 'Intervenants', icon: 'fas fa-users' },
        { id: 'formations', label: 'Formations', icon: 'fas fa-book' },
        { id: 'planifications', label: 'Planifications', icon: 'fas fa-calendar' },
        { id: 'statistiques', label: 'Statistiques', icon: 'fas fa-chart-bar' },
      ];
    }
    if (role === 'gestionnaire_regional') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
        { id: 'planifications', label: 'Planifications', icon: 'fas fa-calendar' },
        { id: 'statistiques', label: 'Statistiques', icon: 'fas fa-chart-bar' },
      ];
    }
    if (role === 'gestionnaire_local') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
        { id: 'planifications', label: 'Planifications', icon: 'fas fa-calendar' },
      ];
    }
    if (role === 'entreprise') {
      return [
        { id: 'offre', label: 'Offre de formation', icon: 'fas fa-book-open' },
        { id: 'mes-demandes', label: 'Mes demandes', icon: 'fas fa-list' },
        { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
      ];
    }
    if (role === 'intervenant') {
      return [
        { id: 'mes-affectations', label: 'Mes formations', icon: 'fas fa-chalkboard' },
        { id: 'calendrier', label: 'Calendrier', icon: 'fas fa-calendar-alt' },
        { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
      ];
    }
    return [{ id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' }];
  };

  const menuItems = getMenuItems();

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 32px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/images/logo-ofppt.png" alt="Logo" style={{ height: '45px' }} />
        <div>
          <h1 style={{ fontSize: '18px', margin: 0 }}>OFPPT Formation Continue</h1>
          <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>Plateforme de gestion</p>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '8px' }}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              background: activeTab === item.id ? '#e6f4fa' : 'none',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              color: activeTab === item.id ? '#0090D0' : '#475569',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative' }}>
          <i className="fas fa-bell" style={{ fontSize: '18px', color: '#475569' }}></i>
          {notifCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-8px',
              background: '#ef4444',
              color: 'white',
              fontSize: '9px',
              borderRadius: '50%',
              padding: '2px 5px'
            }}>{notifCount}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #0090D0, #0077a8)',
            borderRadius: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600
          }}>
            {user?.nom?.charAt(0)}{user?.prenom?.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.nom} {user?.prenom}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {user?.role === 'admin_central' ? 'Admin Central' : user?.role}
            </div>
          </div>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;