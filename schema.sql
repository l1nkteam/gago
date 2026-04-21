-- BizLink AI - Database Schema (Optimized for CentOS/MariaDB)

-- Create Database if not exists (Requires root permissions)
-- CREATE DATABASE IF NOT EXISTS bizlink_ai;
-- USE bizlink_ai;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'AGENCY', 'TEAM', 'CLIENT') NOT NULL,
    avatar_url TEXT,
    agency_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
);

-- 2. Agencies Table
CREATE TABLE IF NOT EXISTS agencies (
    id VARCHAR(255) PRIMARY KEY,
    owner_id VARCHAR(255),
    company_name VARCHAR(255) NOT NULL,
    niche VARCHAR(100),
    subscription_plan VARCHAR(50) DEFAULT 'Freelancer',
    billing_status ENUM('active', 'past_due', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(255) PRIMARY KEY,
    agency_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    website TEXT,
    niche VARCHAR(100),
    country VARCHAR(100),
    status ENUM('new', 'contacted', 'qualified', 'converted') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_lead_agency (agency_id),
    INDEX idx_lead_niche (niche),
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);

-- 4. Deals (Sales Pipeline)
CREATE TABLE IF NOT EXISTS deals (
    id VARCHAR(255) PRIMARY KEY,
    lead_id VARCHAR(255),
    agency_id VARCHAR(255),
    value DECIMAL(10,2),
    stage ENUM('Discovery', 'Contacted', 'Proposal', 'Closed Won') DEFAULT 'Discovery',
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);

-- 5. Audits Table
CREATE TABLE IF NOT EXISTS audits (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255),
    url TEXT NOT NULL,
    seo_score INT,
    performance_score INT,
    report_data LONGTEXT, -- Stores Markdown/JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default Admin Seed
REPLACE INTO users (id, name, email, password_hash, role) 
VALUES ('admin-001', 'System Administrator', 'admin@bizlink.ai', '$2y$10$abcdefghijklmnopqrstuvwxyza12345678901234567890', 'ADMIN');
