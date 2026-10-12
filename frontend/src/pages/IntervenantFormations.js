 import React, { useState, useEffect } from 'react';
import { getAffectations, validerAffectation, refuserAffectation } from '../services/api';

const IntervenantFormations = () => {
    const [affectations, setAffectations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAffectations();
    }, []);

    const fetchAffectations = async () => {
        try {
            const response = await getAffectations();
            // Filtrer pour ne voir que ses propres affectations
            const mesAffectations = response.data.filter(a => a.intervenant_nom);
            setAffectations(mesAffectations);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccepter = async (id) => {
        try {
            await validerAffectation(id);
            fetchAffectations();
            alert('✅ Vous avez accepté la mission');
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleRefuser = async (id) => {
        if (window.confirm('Refuser cette mission ?')) {
            try {
                await refuserAffectation(id);
                fetchAffectations();
                alert('❌ Mission refusée');
            } catch (error) {
                console.error('Erreur:', error);
            }
        }
    };

    const getStatutBadge = (statut) => {
        const styles = {
            'propose': { background: '#fed7aa', color: '#92400e', label: '📨 Proposition reçue' },
            'valide': { background: '#d1fae5', color: '#065f46', label: '✅ Acceptée' },
            'refuse': { background: '#fef2f2', color: '#dc2626', label: '❌ Refusée' }
        };
        const s = styles[statut] || styles.propose;
        return <span style={{ padding: '4px 12px', borderRadius: '40px', fontSize: '12px', fontWeight: 500, ...s }}>{s.label}</span>;
    };

    if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Mes formations</h1>
                <p style={{ color: '#64748b' }}>Consultez et gérez vos missions</p>
            </div>

            {affectations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <i className="fas fa-chalkboard" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                    <p style={{ color: '#64748b' }}>Aucune mission pour le moment</p>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>Vous serez notifié quand on vous proposera une formation</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {affectations.map((a) => (
                        <div key={a.id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{a.theme_intitule}</h3>
                                    <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>
                                        <p><i className="fas fa-building"></i> Entreprise: {a.entreprise_nom}</p>
                                        <p><i className="fas fa-calendar"></i> Date: {new Date(a.date_debut_prevue).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>{getStatutBadge(a.statut_validation)}</div>
                            </div>
                            {a.statut_validation === 'propose' && (
                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                    <button onClick={() => handleAccepter(a.id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '40px', cursor: 'pointer' }}>
                                        <i className="fas fa-check"></i> Accepter
                                    </button>
                                    <button onClick={() => handleRefuser(a.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '40px', cursor: 'pointer' }}>
                                        <i className="fas fa-times"></i> Refuser
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IntervenantFormations;
