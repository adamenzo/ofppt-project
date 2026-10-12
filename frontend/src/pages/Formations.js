 import React, { useState, useEffect } from 'react';
import { getThemes, createTheme, updateTheme, deleteTheme, getDomaines } from '../services/api';

const Formations = () => {
    const [themes, setThemes] = useState([]);
    const [domaines, setDomaines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        domaine_id: '',
        intitule: '',
        nb_jours: '',
        nb_max_participants: ''
    });

    useEffect(() => {
        fetchThemes();
        fetchDomaines();
    }, []);

    const fetchThemes = async () => {
        try {
            const response = await getThemes();
            setThemes(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDomaines = async () => {
        try {
            const response = await getDomaines();
            setDomaines(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await updateTheme(editing, formData);
            } else {
                await createTheme(formData);
            }
            setShowModal(false);
            resetForm();
            fetchThemes();
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.response?.data?.message || 'Erreur');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce thème de formation ?')) {
            try {
                await deleteTheme(id);
                fetchThemes();
            } catch (error) {
                console.error('Erreur:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ domaine_id: '', intitule: '', nb_jours: '', nb_max_participants: '' });
        setEditing(null);
    };

    const getDomaineNom = (domaineId) => {
        const domaine = domaines.find(d => d.id === domaineId);
        return domaine ? domaine.nom : 'N/A';
    };

    if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Offres de formation</h1>
                    <p style={{ color: '#64748b' }}>Gestion des thèmes et domaines de formation</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ background: '#0090D0', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '40px', fontWeight: 500, cursor: 'pointer' }}
                >
                    <i className="fas fa-plus"></i> Nouveau thème
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Thème</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Domaine</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>Durée (jours)</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>Max participants</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {themes.map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px', fontWeight: 500 }}>{t.intitule}</td>
                                <td style={{ padding: '16px' }}>{getDomaineNom(t.domaine_id)}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>{t.nb_jours}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>{t.nb_max_participants}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <button onClick={() => { setEditing(t.id); setFormData(t); setShowModal(true); }} style={{ background: 'none', border: 'none', color: '#0090D0', cursor: 'pointer', marginRight: '12px' }}>
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                        <i className="fas fa-trash"></i>
                                    </button>
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
                        <h2 style={{ marginBottom: '20px' }}>{editing ? 'Modifier' : 'Ajouter'} un thème</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Domaine</label>
                                <select
                                    value={formData.domaine_id}
                                    onChange={(e) => setFormData({...formData, domaine_id: parseInt(e.target.value)})}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    required
                                >
                                    <option value="">Sélectionner un domaine</option>
                                    {domaines.map(d => (
                                        <option key={d.id} value={d.id}>{d.nom}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Intitulé du thème</label>
                                <input
                                    type="text"
                                    value={formData.intitule}
                                    onChange={(e) => setFormData({...formData, intitule: e.target.value})}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label>Nombre de jours</label>
                                    <input
                                        type="number"
                                        value={formData.nb_jours}
                                        onChange={(e) => setFormData({...formData, nb_jours: parseInt(e.target.value)})}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Max participants</label>
                                    <input
                                        type="number"
                                        value={formData.nb_max_participants}
                                        onChange={(e) => setFormData({...formData, nb_max_participants: parseInt(e.target.value)})}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="submit" style={{ background: '#0090D0', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', flex: 1 }}>Enregistrer</button>
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ background: '#e2e8f0', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', flex: 1 }}>Annuler</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Formations;
