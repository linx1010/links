-- =====================================================
-- SCHEMA DE BANCO DE DADOS - GESTÃO DE PROJETOS / HORAS
-- Compatível com MySQL 8.x
-- =====================================================

-- Ordem importa por causa das FKs → sempre dropar dependentes primeiro
DROP TABLE IF EXISTS time_entry_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS timesheets;
DROP TABLE IF EXISTS time_entries;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS schedule_usersß;

-- ======================
-- TABELA: organizations
-- ======================
CREATE TABLE organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    timezone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============
-- TABELA: users
-- ============
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT,
    hourly_rate DECIMAL(15,2),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ===============
-- TABELA: clients
-- ===============
CREATE TABLE clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    default_currency CHAR(3),
    payment_terms_days INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ================
-- TABELA: projects
-- ================
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    client_id BIGINT,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    status TEXT,
    budget_hours DECIMAL(15,2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- =============
-- TABELA: tasks
-- =============
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT,
    estimated_hours DECIMAL(15,2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- ===================
-- TABELA: time_entries
-- ===================
CREATE TABLE time_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    task_id BIGINT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INT,
    description TEXT,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- ==================
-- TABELA: timesheets
-- ==================
CREATE TABLE timesheets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    status TEXT,
    approved_by BIGINT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- =================
-- TABELA: invoices
-- =================
CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    organization_id BIGINT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(15,2),
    status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ============
-- TABELA: tags
-- ============
CREATE TABLE tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- =====================
-- TABELA: time_entry_tags
-- =====================
CREATE TABLE time_entry_tags (
    time_entry_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (time_entry_id, tag_id),
    FOREIGN KEY (time_entry_id) REFERENCES time_entries(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);
-- =====================
-- TABELAS: agendas avulsas
-- =====================
CREATE TABLE schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    location TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE schedule_users (
    schedule_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role TEXT, -- ex: "organizer", "participant"
    PRIMARY KEY (schedule_id, user_id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

