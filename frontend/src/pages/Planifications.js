 import React, { useState, useEffect } from 'react';
import { getPlanifications, createPlanification, validerPlanification, annulerPlanification, getOffres } from '../services/api';

const Planifications = () => {
    const [planifications, setPlanifications] = useState([]);
    const [offres, setOffres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        offre_formation_id: '',
        nb_groupes: '1',
        date_debut_prevue: ''
    });

    useEffect(() => {
        fetchPlanifications();
        fetchOffres();
    }, []);

    const fetchPlanifications = async () => {
        try {
            const response = await getPlanifications();
            setPlanifications(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOffres = async () => {
        try {
            const response = await getOffres();
            setOffres(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createPlanification(formData);
            setShowModal(false);
            setFormData({ offre_formation_id: '', nb_groupes: '1', date_debut_prevue: '' });
            fetchPlanifications();
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.response?.data?.message || 'Erreur');
        }
    };

    const handleValider = async (id) => {
        try {
            await validerPlanification(id);
            fetchPlanifications();
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleAnnuler = async (id) => {
        if (window.confirm('Annuler cette planification ?')) {
            try {
                await annulerPlanification(id);
                fetchPlanifications();
            } catch (error) {
                console.error('Erreur:', error);
            }
        }
    };

    const getStatutBadge = (statut) => {
        const styles = {
            'en_attente': { background: '#fed7aa', color: '#92400e' },
            'validee': { background: '#d1fae5', color: '#065f46' },
            'terminee': { background: '#dbeafe', color: '#1e40af' },
            'annulee': { background: '#fef2f2', color: '#dc2626' }
        };
        const s = styles[statut] || styles.en_attente;
        const labels = {
            'en_attente': 'En attente',
            'validee': 'Validée',
            'terminee': 'Terminée',
            'annulee': 'Annulée'
        };
        return <span style={{ padding: '4px 12px', borderRadius: '40px', fontSize: '12px', fontWeight: 500, ...s }}>{labels[statut]}</span>;
    };

    if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Planifications</h1>
                    <p style={{ color: '#64748b' }}>Gestion des demandes de formation des entreprises</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ background: '#0090D0', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '40px', fontWeight: 500, cursor: 'pointer' }}
                >
                    <i className="fas fa-plus"></i> Nouvelle planification
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Entreprise</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Thème</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>Groupes</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>Date début</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>Statut</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {planifications.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px', fontWeight: 500 }}>{p.entreprise_nom}</td>
                                <td style={{ padding: '16px' }}>{p.theme_intitule}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>{p.nb_groupes}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>{new Date(p.date_debut_prevue).toLocaleDateString()}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>{getStatutBadge(p.statut)}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    {p.statut === 'en_attente' && (
                                        <button onClick={() => handleValider(p.id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', marginRight: '8px', fontSize: '12px' }}>
                                            <i className="fas fa-check"></i> Valider
                                        </button>
                                    )}
                                    {p.statut !== 'annulee' && p.statut !== 'terminee' && (
                                        <button onClick={() => handleAnnuler(p.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                                            <i className="fas fa-times"></i> Annuler
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '500px' }}>
                        <h2 style={{ marginBottom: '20px' }}>Nouvelle planification</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Formation</label>
                                <select
                                    value={formData.offre_formation_id}
                                    onChange={(e) => setFormData({...formData, offre_formation_id: parseInt(e.target.value)})}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    required
                                >
                                    <option value="">Sélectionner une formation</option>
                                    {offres.map(o => (
                                        <option key={o.id} value={o.id}>{o.theme_intitule} ({o.annee})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Nombre de groupes</label>
                                <input
                                    type="number"
                                    value={formData.nb_groupes}
                                    onChange={(e) => setFormData({...formData, nb_groupes: e.target.value})}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    min="1"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Date de début</label>
                                <input
                                    type="date"
                                    value={formData.date_debut_prevue}
                                    onChange={(e) => setFormData({...formData, date_debut_prevue: e.target.value})}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="submit" style={{ background: '#0090D0', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', flex: 1 }}>Créer</button>
                                <button type="button" onClick={() => { setShowModal(false); setFormData({ offre_formation_id: '', nb_groupes: '1', date_debut_prevue: '' }); }} style={{ background: '#e2e8f0', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', flex: 1 }}>Annuler</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Planifications;
