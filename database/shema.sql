-- ======================================================
-- BASE DE DONNÉES : Gestion Formation Continue OFPPT
-- ======================================================

-- Supprimer la base si elle existe
DROP DATABASE IF EXISTS ofppt_formation;

-- Créer la base
CREATE DATABASE ofppt_formation;
USE ofppt_formation;

-- 1. TABLE DES RÔLES
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) UNIQUE NOT NULL
);

-- 2. TABLE DES UTILISATEURS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    telephone VARCHAR(20),
    adresse TEXT,
    raison_sociale VARCHAR(200),
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. TABLE DES INTERVENANTS
CREATE TABLE intervenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    type_interne BOOLEAN DEFAULT TRUE,
    date_naissance DATE,
    genre ENUM('M', 'F'),
    lieu_affectation VARCHAR(200),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. TABLE DES DIPLOMES
CREATE TABLE diplomes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intitule VARCHAR(200) NOT NULL,
    ecole VARCHAR(150),
    annee_obtention YEAR,
    niveau VARCHAR(50),
    specialite VARCHAR(150)
);

-- 5. TABLE DES CERTIFICATIONS
CREATE TABLE certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    intitule VARCHAR(200) NOT NULL,
    type_certif VARCHAR(100),
    domaine VARCHAR(100),
    organisme VARCHAR(150),
    date_obtention DATE
);

-- 6. LIAISON INTERVENANT - DIPLOMES
CREATE TABLE intervenant_diplome (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intervenant_id INT NOT NULL,
    diplome_id INT NOT NULL,
    FOREIGN KEY (intervenant_id) REFERENCES intervenants(id) ON DELETE CASCADE,
    FOREIGN KEY (diplome_id) REFERENCES diplomes(id) ON DELETE CASCADE
);

-- 7. LIAISON INTERVENANT - CERTIFICATIONS
CREATE TABLE intervenant_certification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intervenant_id INT NOT NULL,
    certification_id INT NOT NULL,
    FOREIGN KEY (intervenant_id) REFERENCES intervenants(id) ON DELETE CASCADE,
    FOREIGN KEY (certification_id) REFERENCES certifications(id) ON DELETE CASCADE
);

-- 8. TABLE DES DOMAINES
CREATE TABLE domaines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) UNIQUE NOT NULL
);

-- 9. TABLE DES THÈMES DE FORMATION
CREATE TABLE themes_formation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domaine_id INT NOT NULL,
    intitule VARCHAR(200) NOT NULL,
    nb_jours INT NOT NULL,
    nb_max_participants INT NOT NULL,
    FOREIGN KEY (domaine_id) REFERENCES domaines(id)
);

-- 10. TABLE DE L'OFFRE DE FORMATION
CREATE TABLE offre_formation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    annee INT NOT NULL,
    theme_id INT NOT NULL,
    region_id INT,
    FOREIGN KEY (theme_id) REFERENCES themes_formation(id) ON DELETE CASCADE
);

-- 11. TABLE DES PLANIFICATIONS
CREATE TABLE planifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entreprise_id INT NOT NULL,
    offre_formation_id INT NOT NULL,
    nb_groupes INT DEFAULT 1,
    date_debut_prevue DATE NOT NULL,
    statut ENUM('en_attente', 'validee', 'annulee', 'terminee') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entreprise_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (offre_formation_id) REFERENCES offre_formation(id)
);

-- 12. TABLE DES AFFECTATIONS
CREATE TABLE affectations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    planification_id INT NOT NULL,
    intervenant_id INT NOT NULL,
    statut_validation ENUM('propose', 'valide', 'refuse') DEFAULT 'propose',
    FOREIGN KEY (planification_id) REFERENCES planifications(id) ON DELETE CASCADE,
    FOREIGN KEY (intervenant_id) REFERENCES intervenants(id)
);

-- 13. TABLE DES NOTIFICATIONS
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    lue BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ======================================================
-- DONNÉES INITIALES (seed)
-- ======================================================

INSERT INTO roles (nom) VALUES 
    ('admin_central'), 
    ('gestionnaire_regional'), 
    ('gestionnaire_local'), 
    ('entreprise'), 
    ('intervenant');

INSERT INTO domaines (nom) VALUES 
    ('Digital'), 
    ('Industriel'), 
    ('Génie Civil'), 
    ('Management'), 
    ('Logistique');

SELECT '✅ Base de données créée avec succès !' as message;