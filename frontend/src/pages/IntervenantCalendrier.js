 import React, { useState, useEffect } from 'react';
import { getAffectations } from '../services/api';

const IntervenantCalendrier = () => {
    const [affectations, setAffectations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        fetchAffectations();
    }, []);

    const fetchAffectations = async () => {
        try {
            const response = await getAffectations();
            const validees = response.data.filter(a => a.statut_validation === 'valide');
            setAffectations(validees);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        
        // Jours du mois précédent
        const startWeekday = firstDay.getDay();
        for (let i = startWeekday - 1; i >= 0; i--) {
            const prevDate = new Date(year, month, -i);
            days.push({ date: prevDate, isCurrentMonth: false });
        }
        
        // Jours du mois actuel
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        
        // Jours du mois suivant (pour compléter la grille)
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        
        return days;
    };

    const getFormationsForDate = (date) => {
        return affectations.filter(a => {
            const formationDate = new Date(a.date_debut_prevue);
            return formationDate.toDateString() === date.toDateString();
        });
    };

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const days = getDaysInMonth(currentMonth);

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
        setSelectedDate(null);
    };

    if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Mon calendrier</h1>
                <p style={{ color: '#64748b' }}>Visualisez vos missions</p>
            </div>

            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {/* En-tête du calendrier */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                    <button onClick={prevMonth} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
                    <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
                    <button onClick={nextMonth} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>→</button>
                </div>

                {/* Jours de la semaine */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {weekDays.map(day => (
                        <div key={day} style={{ padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '14px', color: '#64748b' }}>{day}</div>
                    ))}
                </div>

                {/* Grille des jours */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '500px' }}>
                    {days.map((day, index) => {
                        const formations = getFormationsForDate(day.date);
                        const hasFormation = formations.length > 0;
                        const isSelected = selectedDate && selectedDate.toDateString() === day.date.toDateString();
                        const isToday = new Date().toDateString() === day.date.toDateString();
                        
                        return (
                            <div
                                key={index}
                                onClick={() => setSelectedDate(day.date)}
                                style={{
                                    padding: '12px',
                                    borderBottom: '1px solid #f1f5f9',
                                    borderRight: '1px solid #f1f5f9',
                                    background: isSelected ? '#e6f4fa' : (day.isCurrentMonth ? 'white' : '#f8fafc'),
                                    cursor: 'pointer',
                                    minHeight: '100px',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ 
                                    fontWeight: isToday ? 700 : 400, 
                                    color: isToday ? '#0090D0' : (day.isCurrentMonth ? '#0f172a' : '#94a3b8'),
                                    marginBottom: '8px'
                                }}>
                                    {day.date.getDate()}
                                </div>
                                {hasFormation && (
                                    <div style={{ 
                                        background: '#d1fae5', 
                                        color: '#065f46', 
                                        fontSize: '10px', 
                                        padding: '4px 8px', 
                                        borderRadius: '12px',
                                        marginTop: '4px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {formations.length} formation{formations.length > 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Détail du jour sélectionné */}
                {selectedDate && (
                    <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
                            {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </h3>
                        {getFormationsForDate(selectedDate).length === 0 ? (
                            <p style={{ color: '#64748b' }}>Aucune formation ce jour</p>
                        ) : (
                            getFormationsForDate(selectedDate).map((a, i) => (
                                <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '8px' }}>{a.theme_intitule}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                                        <p><i className="fas fa-building"></i> Entreprise: {a.entreprise_nom}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IntervenantCalendrier;
