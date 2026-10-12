 import React, { useState, useEffect } from 'react';
import { getIntervenants, createIntervenant, updateIntervenant, deleteIntervenant } from '../services/api';

const Intervenants = () => {
    const [intervenants, setIntervenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        telephone: '',
        adresse: '',
        matricule: '',
        type_interne: 1,
        date_naissance: '',
        genre: 'M',
        lieu_affectation: ''
    });

    useEffect(() => {
        fetchIntervenants();
    }, []);

    const fetchIntervenants = async () => {
        try {
            const response = await getIntervenants();
            setIntervenants(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await updateIntervenant(editing, formData);
            } else {
                await createIntervenant(formData);
            }
            setShowModal(false);
            resetForm();
            fetchIntervenants();
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.response?.data?.message || 'Erreur');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cet intervenant ?')) {
            try {
                await deleteIntervenant(id);
                fetchIntervenants();
            } catch (error) {
                console.error('Erreur:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            email: '', password: '', nom: '', prenom: '', telephone: '', adresse: '',
            matricule: '', type_interne: 1, date_naissance: '', genre: 'M', lieu_affectation: ''
        });
        setEditing(null);
    };

    if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Intervenants</h1>
                    <p style={{ color: '#64748b' }}>Gestion des formateurs et intervenants</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ background: '#0090D0', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '40px', fontWeight: 500, cursor: 'pointer' }}
                >
                    <i className="fas fa-plus"></i> Nouvel intervenant
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Matricule</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Nom & Prénom</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Type</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {intervenants.map((i) => (
                            <tr key={i.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px' }}>{i.matricule}</td>
                                <td style={{ padding: '16px' }}>{i.nom} {i.prenom}</td>
                                <td style={{ padding: '16px' }}>{i.email}</td>
                                <td style={{ padding: '16px' }}>{i.type_interne ? 'Interne' : 'Externe'}</td>
                                <td style={{ padding: '16px' }}>
                                    <button onClick={() => { setEditing(i.id); setFormData(i); setShowModal(true); }} style={{ background: 'none', border: 'none', color: '#0090D0', cursor: 'pointer', marginRight: '12px' }}>
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button onClick={() => handleDelete(i.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
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
                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '500px', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ marginBottom: '20px' }}>{editing ? 'Modifier' : 'Ajouter'} un intervenant</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} required />
                            </div>
                            {!editing && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Mot de passe</label>
                                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} required />
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div><label>Nom</label><input type="text" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} required /></div>
                                <div><label>Prénom</label><input type="text" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} required /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                <div><label>Téléphone</label><input type="text" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                                <div><label>Matricule</label><input type="text" value={formData.matricule} onChange={(e) => setFormData({...formData, matricule: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} required /></div>
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

export default Intervenants;
