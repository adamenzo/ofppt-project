 
import React, { useState, useEffect } from 'react';
import { getDashboardStats, getTopDomaines, getTopEntreprises, getEvolutionAnnuelle } from '../services/api';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Statistiques = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [dashboardRes, domainesRes, entreprisesRes, evolutionRes] = await Promise.all([
                getDashboardStats(),
                getTopDomaines(),
                getTopEntreprises(),
                getEvolutionAnnuelle()
            ]);

            setStats({
                stats_globales: dashboardRes.data.stats_globales,
                taux_realisation: dashboardRes.data.taux_realisation,
                top_domaines: domainesRes.data,
                top_entreprises: entreprisesRes.data,
                evolution_annuelle: evolutionRes.data
            });
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Chargement...</div>;

    const topDomainesData = {
        labels: stats?.top_domaines?.map(d => d.domaine) || [],
        datasets: [{
            data: stats?.top_domaines?.map(d => d.nombre_planifications) || [],
            backgroundColor: ['#0090D0', '#8DC63F', '#A7A9AC', '#f59e0b', '#ef4444'],
            borderWidth: 0
        }]
    };

    const evolutionData = {
        labels: stats?.evolution_annuelle?.map(e => e.annee) || [],
        datasets: [
            {
                label: 'Total planifications',
                data: stats?.evolution_annuelle?.map(e => e.total) || [],
                backgroundColor: '#0090D0',
                borderRadius: 8
            },
            {
                label: 'Réalisées',
                data: stats?.evolution_annuelle?.map(e => e.realisees) || [],
                backgroundColor: '#8DC63F',
                borderRadius: 8
            }
        ]
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Statistiques</h1>
                <p style={{ color: '#64748b' }}>Analyse des performances et indicateurs clés</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', fontWeight: 700, color: '#0090D0' }}>{stats?.stats_globales?.total_planifications || 0}</div>
                    <div style={{ color: '#64748b', marginTop: '8px' }}>Total planifications</div>
                </div>
                <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', fontWeight: 700, color: '#8DC63F' }}>{stats?.stats_globales?.planifications_terminees || 0}</div>
                    <div style={{ color: '#64748b', marginTop: '8px' }}>Formations terminées</div>
                </div>
                <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', fontWeight: 700, color: '#f59e0b' }}>{stats?.stats_globales?.planifications_validees || 0}</div>
                    <div style={{ color: '#64748b', marginTop: '8px' }}>En cours / validées</div>
                </div>
                <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', fontWeight: 700, color: '#10b981' }}>{stats?.taux_realisation?.taux || 0}%</div>
                    <div style={{ color: '#64748b', marginTop: '8px' }}>Taux de réalisation</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginBottom: '20px' }}>Top domaines de formation</h3>
                    <Doughnut data={topDomainesData} options={{ responsive: true, maintainAspectRatio: true }} />
                </div>
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginBottom: '20px' }}>Évolution annuelle</h3>
                    <Bar data={evolutionData} options={{ responsive: true, maintainAspectRatio: true }} />
                </div>
            </div>

            <div style={{ marginTop: '32px', background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginBottom: '20px' }}>Top entreprises</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Entreprise</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Planifications</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Réalisées</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Taux</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats?.top_entreprises?.map((e, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px', fontWeight: 500 }}>{e.entreprise}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{e.total_planifications}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{e.realisees}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{Math.round((e.realisees / e.total_planifications) * 100)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Statistiques;