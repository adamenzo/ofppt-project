import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Ajouter le token à chaque requête
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ========== AUTH ==========
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getMe = () => api.get('/auth/me');

// ========== STATISTIQUES ==========
export const getDashboardStats = () => api.get('/statistiques/dashboard');
export const getTopDomaines = () => api.get('/statistiques/top-domaines');
export const getTopEntreprises = () => api.get('/statistiques/top-entreprises');
export const getEvolutionAnnuelle = () => api.get('/statistiques/evolution-annuelle');

// ========== INTERVENANTS ==========
export const getIntervenants = () => api.get('/intervenants');
export const getIntervenantById = (id) => api.get(`/intervenants/${id}`);
export const createIntervenant = (data) => api.post('/intervenants', data);
export const updateIntervenant = (id, data) => api.put(`/intervenants/${id}`, data);
export const deleteIntervenant = (id) => api.delete(`/intervenants/${id}`);

// ========== DOMAINES ==========
export const getDomaines = () => api.get('/domaines');
export const createDomaine = (data) => api.post('/domaines', data);
export const updateDomaine = (id, data) => api.put(`/domaines/${id}`, data);
export const deleteDomaine = (id) => api.delete(`/domaines/${id}`);

// ========== THÈMES ==========
export const getThemes = () => api.get('/themes');
export const createTheme = (data) => api.post('/themes', data);
export const updateTheme = (id, data) => api.put(`/themes/${id}`, data);
export const deleteTheme = (id) => api.delete(`/themes/${id}`);

// ========== OFFRES ==========
export const getOffres = () => api.get('/offres');
export const createOffre = (data) => api.post('/offres', data);
export const updateOffre = (id, data) => api.put(`/offres/${id}`, data);
export const deleteOffre = (id) => api.delete(`/offres/${id}`);

// ========== PLANIFICATIONS ==========
export const getPlanifications = () => api.get('/planifications');
export const getPlanificationById = (id) => api.get(`/planifications/${id}`);
export const createPlanification = (data) => api.post('/planifications', data);
export const getMesPlanifications = () => api.get('/planifications/mes-planifications');
export const validerPlanification = (id) => api.put(`/planifications/${id}/valider`);
export const annulerPlanification = (id) => api.post(`/planifications/${id}/annuler`);
export const deletePlanification = (id) => api.delete(`/planifications/${id}`);

// ========== AFFECTATIONS ==========
export const getAffectations = () => api.get('/affectations');
export const createAffectation = (data) => api.post('/affectations', data);
export const validerAffectation = (id) => api.put(`/affectations/${id}/valider`);
export const refuserAffectation = (id) => api.put(`/affectations/${id}/refuser`);
export const deleteAffectation = (id) => api.delete(`/affectations/${id}`);

// ========== NOTIFICATIONS ==========
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/lire`);
export const markAllNotificationsAsRead = () => api.put('/notifications/lire-tout');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

export default api;