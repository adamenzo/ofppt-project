 import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';

const Dashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Erreur chargement stats:', error);
        // Données par défaut pour éviter l'écran vide
        setStats({
          stats_globales: { total_planifications: 0, total_intervenants: 0, total_entreprises: 0 },
          taux_realisation: { taux: 0 }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Slides du carrousel (tu peux remplacer les URLs par tes images)
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=400&fit=crop',
      title: 'Formation Continue',
      description: 'Développez les compétences de vos collaborateurs'
    },
    {
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=400&fit=crop',
      title: 'Partenariat avec les Entreprises',
      description: 'Construisons ensemble la formation de demain'
    },
    {
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop',
      title: 'Certifications professionnelles',
      description: 'Validez les acquis avec des certifications reconnues'
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div style={{ padding: '32px', textAlign: 'center' }}>Chargement du tableau de bord...</div>;
  }

  const statsData = stats?.stats_globales || { total_planifications: 0, total_intervenants: 0, total_entreprises: 0 };
  const taux = stats?.taux_realisation?.taux || 0;

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Carrousel */}
      <div style={{ position: 'relative', marginBottom: '40px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <img
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          style={{ width: '100%', height: '300px', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
          color: 'white',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: 0 }}>{slides[currentSlide].title}</h2>
          <p style={{ margin: '8px 0 0' }}>{slides[currentSlide].description}</p>
        </div>
        <button
          onClick={prevSlide}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '20px'
          }}
        >
          ❮
        </button>
        <button
          onClick={nextSlide}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '20px'
          }}
        >
          ❯
        </button>
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px'
        }}>
          {slides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: currentSlide === idx ? '#0090D0' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>

      {/* Indicateurs clés */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <i className="fas fa-graduation-cap" style={{ fontSize: '32px', color: '#0090D0', marginBottom: '12px' }}></i>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{statsData.total_planifications}</div>
          <div style={{ color: '#64748b' }}>Formations programmées</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <i className="fas fa-chalkboard-user" style={{ fontSize: '32px', color: '#8DC63F', marginBottom: '12px' }}></i>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{statsData.total_intervenants}</div>
          <div style={{ color: '#64748b' }}>Intervenants actifs</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <i className="fas fa-building" style={{ fontSize: '32px', color: '#f59e0b', marginBottom: '12px' }}></i>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{statsData.total_entreprises}</div>
          <div style={{ color: '#64748b' }}>Entreprises partenaires</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <i className="fas fa-chart-line" style={{ fontSize: '32px', color: '#ef4444', marginBottom: '12px' }}></i>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{taux}%</div>
          <div style={{ color: '#64748b' }}>Taux de réalisation</div>
        </div>
      </div>

      {/* Actions rapides */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '20px' }}>Actions rapides</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { icon: 'fa-calendar-plus', color: '#0090D0', label: 'Planifier une formation', desc: 'Soumettez une nouvelle demande', tabId: 'offre' },
            { icon: 'fa-users', color: '#8DC63F', label: 'Consulter les intervenants', desc: 'Trouvez le formateur idéal', tabId: 'intervenants' },
            { icon: 'fa-chart-bar', color: '#f59e0b', label: 'Voir les rapports', desc: 'Analysez vos performances', tabId: 'statistiques' }
          ].map((action, idx) => (
            <div
              key={idx}
              onClick={() => setActiveTab && setActiveTab(action.tabId)}
              style={{ background: 'white', borderRadius: '16px', padding: '24px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <i className={`fas ${action.icon}`} style={{ fontSize: '36px', color: action.color, marginBottom: '12px' }}></i>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{action.label}</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>{action.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actualités */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
  <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <i className="fas fa-newspaper" style={{ color: '#0090D0' }}></i> À la une
  </h2>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
      <div style={{ minWidth: '80px', fontSize: '13px', fontWeight: 500, color: '#0090D0' }}>15 Mars 2026</div>
      <div>
        <strong style={{ fontSize: '16px' }}>Lancement de la plateforme de formation continue</strong>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', lineHeight: '1.4' }}>Simplifiez la gestion de vos formations avec notre nouvel outil digital. Plus de 50 thèmes disponibles.</p>
      </div>
    </div>

    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
      <div style={{ minWidth: '80px', fontSize: '13px', fontWeight: 500, color: '#8DC63F' }}>10 Avril 2026</div>
      <div>
        <strong style={{ fontSize: '16px' }}>Partenariat avec l'UM6P</strong>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', lineHeight: '1.4' }}>Formation de 1000 jeunes en intelligence artificielle et data science. Inscriptions ouvertes.</p>
      </div>
    </div>

    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
      <div style={{ minWidth: '80px', fontSize: '13px', fontWeight: 500, color: '#f59e0b' }}>1 Mai 2026</div>
      <div>
        <strong style={{ fontSize: '16px' }}>Appel à candidatures pour intervenants</strong>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', lineHeight: '1.4' }}>Rejoignez notre réseau de formateurs experts dans tous les domaines (digital, industriel, management...).</p>
      </div>
    </div>

    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
      <div style={{ minWidth: '80px', fontSize: '13px', fontWeight: 500, color: '#10b981' }}>20 Mai 2026</div>
      <div>
        <strong style={{ fontSize: '16px' }}>Nouveaux modules certifiants</strong>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', lineHeight: '1.4' }}>Découvrez nos 10 nouvelles certifications en cybersécurité, cloud computing et leadership.</p>
      </div>
    </div>

    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <div style={{ minWidth: '80px', fontSize: '13px', fontWeight: 500, color: '#8b5cf6' }}>5 Juin 2026</div>
      <div>
        <strong style={{ fontSize: '16px' }}>Webinaire gratuit : La formation continue à l'ère du digital</strong>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', lineHeight: '1.4' }}>Inscrivez-vous gratuitement pour découvrir les enjeux de la digitalisation de la formation.</p>
      </div>
    </div>

  </div>
</div>
    </div>
  );
};

export default Dashboard;