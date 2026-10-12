 import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';

const EntrepriseNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await getNotifications();
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            fetchNotifications();
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            fetchNotifications();
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const getIcon = (message) => {
        if (message.includes('validée')) return '✅';
        if (message.includes('annulée')) return '❌';
        if (message.includes('enregistrée')) return '📝';
        if (message.includes('affecté')) return '👨‍🏫';
        return '🔔';
    };

    if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Notifications</h1>
                    <p style={{ color: '#64748b' }}>Suivez l'évolution de vos demandes</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        style={{ background: '#e2e8f0', border: 'none', padding: '8px 16px', borderRadius: '40px', cursor: 'pointer', fontSize: '13px' }}
                    >
                        <i className="fas fa-check-double"></i> Tout marquer comme lu
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <i className="fas fa-bell-slash" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                    <p style={{ color: '#64748b' }}>Aucune notification</p>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>Les notifications apparaîtront ici</p>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            onClick={() => !notif.lue && handleMarkAsRead(notif.id)}
                            style={{
                                padding: '20px',
                                borderBottom: '1px solid #f1f5f9',
                                background: notif.lue ? 'white' : '#f0f9ff',
                                cursor: notif.lue ? 'default' : 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '24px' }}>{getIcon(notif.message)}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ marginBottom: '8px', fontWeight: notif.lue ? 400 : 500 }}>{notif.message}</p>
                                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        {new Date(notif.created_at).toLocaleDateString()} à {new Date(notif.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                                {!notif.lue && (
                                    <div style={{ width: '8px', height: '8px', background: '#0090D0', borderRadius: '50%' }}></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EntrepriseNotifications;
