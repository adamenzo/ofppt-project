 import React, { useState, useEffect } from 'react';
import { getMesPlanifications, annulerPlanification } from '../services/api';

const EntrepriseDemandes = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDemandes();
    }, []);

    const fetchDemandes = async () => {
        try {
            const response = await getMesPlanifications();
            setDemandes(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnnuler = async (id) => {
        if (window.confirm('Annuler cette demande ?')) {
            try {
                await annulerPlanification(id);
                fetchDemandes();
            } catch (error) {
                alert(error.response?.data?.message || 'Erreur');
            }
        }
    };

    const getStatutBadge = (statut) => {
        const styles = {
            'en_attente': { background: '#fed7aa', color: '#92400e', label: '⏳ En attente' },
            'validee': { background: '#d1fae5', color: '#065f46', label: '✅ Validée' },
            'terminee': { background: '#dbeafe', color: '#1e40af', label: '📗 Terminée' },
            'annulee': { background: '#fef2f2', color: '#dc2626', label: '❌ Annulée' }
        };
        const s = styles[statut] || styles.en_attente;
        return <span style={{ padding: '4px 12px', borderRadius: '40px', fontSize: '12px', fontWeight: 500, ...s }}>{s.label}</span>;
    };

    if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Mes demandes de formation</h1>
                <p style={{ color: '#64748b' }}>Suivez l'état de vos demandes</p>
            </div>

            {demandes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <i className="fas fa-calendar-alt" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                    <p style={{ color: '#64748b' }}>Vous n'avez aucune demande de formation</p>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>Parcourez l'offre de formation pour faire une demande</p>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Formation</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Groupes</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Date début</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Statut</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {demandes.map((d) => (
                                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px', fontWeight: 500 }}>{d.theme_intitule}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>{d.nb_groupes}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>{new Date(d.date_debut_prevue).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>{getStatutBadge(d.statut)}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {d.statut === 'en_attente' && (
                                            <button onClick={() => handleAnnuler(d.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                                                <i className="fas fa-times"></i> Annuler
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EntrepriseDemandes;
