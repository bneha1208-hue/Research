-- ==========================================================
-- LegalPrecedent Database Schema
-- Database: MySQL 8.0+
-- Description: Legal Case Research Assistance Platform
-- ==========================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS legalprecedent_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE legalprecedent_db;

-- 2. Drop tables in reverse dependency order (if re-creating)
DROP TABLE IF EXISTS similar_cases;
DROP TABLE IF EXISTS judgments;
DROP TABLE IF EXISTS cases;
DROP TABLE IF EXISTS legal_provisions;
DROP TABLE IF EXISTS courts;
DROP TABLE IF EXISTS users;

-- ----------------------------------------------------------
-- 3. Table: users
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. Table: courts
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS courts (
    court_id INT AUTO_INCREMENT PRIMARY KEY,
    court_name VARCHAR(150) NOT NULL,
    location VARCHAR(100) NOT NULL,
    court_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_court_location (location),
    INDEX idx_court_level (court_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. Table: legal_provisions
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_provisions (
    provision_id INT AUTO_INCREMENT PRIMARY KEY,
    law_name VARCHAR(100) NOT NULL,
    section VARCHAR(50) NULL,
    article VARCHAR(50) NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_provision_law (law_name),
    INDEX idx_provision_section (section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 6. Table: cases
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS cases (
    case_id INT AUTO_INCREMENT PRIMARY KEY,
    case_title VARCHAR(200) NULL,
    case_description TEXT NOT NULL,
    offence VARCHAR(150) NOT NULL,
    location VARCHAR(100) NOT NULL,
    court_id INT NOT NULL,
    legal_provision_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_case_court
        FOREIGN KEY (court_id) REFERENCES courts(court_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_case_provision
        FOREIGN KEY (legal_provision_id) REFERENCES legal_provisions(provision_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_case_offence (offence),
    INDEX idx_case_location (location),
    INDEX idx_case_court (court_id),
    INDEX idx_case_provision (legal_provision_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 7. Table: judgments
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS judgments (
    judgment_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL UNIQUE,
    case_facts TEXT NOT NULL,
    legal_provisions TEXT NOT NULL,
    court_reasoning TEXT NOT NULL,
    final_decision TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_judgment_case
        FOREIGN KEY (case_id) REFERENCES cases(case_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_judgment_case (case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 8. Table: similar_cases
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS similar_cases (
    similarity_id INT AUTO_INCREMENT PRIMARY KEY,
    current_case_id INT NOT NULL,
    previous_case_id INT NOT NULL,
    similarity_score FLOAT NOT NULL,
    matching_factors TEXT NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sim_current_case
        FOREIGN KEY (current_case_id) REFERENCES cases(case_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sim_previous_case
        FOREIGN KEY (previous_case_id) REFERENCES cases(case_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_sim_current (current_case_id),
    INDEX idx_sim_previous (previous_case_id),
    INDEX idx_sim_score (similarity_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
