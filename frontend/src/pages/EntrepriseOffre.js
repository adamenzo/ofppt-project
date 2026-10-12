 import React, { useState, useEffect } from 'react';
import { getOffres, createPlanification } from '../services/api';

const EntrepriseOffre = () => {
    const [offres, setOffres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedOffre, setSelectedOffre] = useState(null);
    const [formData, setFormData] = useState({
        offre_formation_id: '',
        nb_groupes: 1,
        date_debut_prevue: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [domaineFilter, setDomaineFilter] = useState('');

    useEffect(() => {
        fetchOffres();
    }, []);

    const fetchOffres = async () => {
        try {
            const response = await getOffres();
            setOffres(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlanifier = (offre) => {
        setSelectedOffre(offre);
        setFormData({
            offre_formation_id: offre.id,
            nb_groupes: 1,
            date_debut_prevue: ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createPlanification(formData);
            setShowModal(false);
            alert('✅ Demande de formation envoyée avec succès !');
            fetchOffres();
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.response?.data?.message || 'Erreur lors de la planification');
        }
    };

    // Filtrer les offres
    const domaines = [...new Set(offres.map(o => o.domaine_nom))];
    const filteredOffres = offres.filter(offre => {
        const matchSearch = offre.theme_intitule.toLowerCase().includes(searchTerm.toLowerCase());
        const matchDomaine = !domaineFilter || offre.domaine_nom === domaineFilter;
        return matchSearch && matchDomaine;
    });

    if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Chargement des formations...</div>;

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Offre de formation</h1>
                <p style={{ color: '#64748b' }}>Découvrez nos formations et planifiez vos sessions</p>
            </div>

            {/* Filtres */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                    <input
                        type="text"
                        placeholder="🔍 Rechercher une formation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' }}
                    />
                </div>
                <select
                    value={domaineFilter}
                    onChange={(e) => setDomaineFilter(e.target.value)}
                    style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: 'white' }}
                >
                    <option value="">Tous les domaines</option>
                    {domaines.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* Grille des formations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {filteredOffres.map((offre) => (
                    <div key={offre.id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '20px', transition: 'all 0.2s', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <span style={{ background: '#e6f4fa', color: '#0090D0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500 }}>
                                {offre.domaine_nom}
                            </span>
                            <span style={{ color: '#64748b', fontSize: '12px' }}>Année {offre.annee}</span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{offre.theme_intitule}</h3>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', color: '#64748b', fontSize: '13px' }}>
                            <span><i className="fas fa-clock"></i> {offre.nb_jours} jours</span>
                            <span><i className="fas fa-users"></i> Max {offre.nb_max_participants} pers.</span>
                        </div>
                        <button
                            onClick={() => handlePlanifier(offre)}
                            style={{ width: '100%', background: '#0090D0', color: 'white', border: 'none', padding: '10px', borderRadius: '12px', fontWeight: 500, cursor: 'pointer' }}
                        >
                            📅 Planifier cette formation
                        </button>
                    </div>
                ))}
            </div>

            {filteredOffres.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                    <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                    <p>Aucune formation trouvée</p>
                </div>
            )}

            {/* Modal de planification */}
            {showModal && selectedOffre && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '450px' }}>
                        <h2 style={{ marginBottom: '8px' }}>Planifier la formation</h2>
                        <p style={{ color: '#64748b', marginBottom: '24px' }}>{selectedOffre.theme_intitule}</p>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nombre de groupes</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.nb_groupes}
                                    onChange={(e) => setFormData({...formData, nb_groupes: parseInt(e.target.value)})}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Date de début souhaitée</label>
                                <input
                                    type="date"
                                    value={formData.date_debut_prevue}
                                    onChange={(e) => setFormData({...formData, date_debut_prevue: e.target.value})}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" style={{ background: '#0090D0', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', flex: 1 }}>Envoyer la demande</button>
                                <button type="button" onClick={() => setShowModal(false)} style={{ background: '#e2e8f0', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', flex: 1 }}>Annuler</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntrepriseOffre;
