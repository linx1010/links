CREATE TABLE organizations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('admin','manager','member','contractor')),
  hourly_rate NUMERIC(12,2),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE or alter TABLE clients (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  default_currency CHAR(3) NOT NULL DEFAULT 'BRL',
  payment_terms_days INT NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id),
  client_id BIGINT REFERENCES clients(id),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planned','active','on_hold','completed','cancelled')),
  start_date DATE,
  end_date DATE,
  budget_hours NUMERIC(10,2),
  budget_amount NUMERIC(12,2),
  billing_type TEXT NOT NULL CHECK (billing_type IN ('time_and_materials','fixed_fee','non_billable')),
  default_hourly_rate NUMERIC(12,2),
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_members (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  role TEXT,
  hourly_rate_override NUMERIC(12,2),
  allocation_pct NUMERIC(5,2) CHECK (allocation_pct >= 0 AND allocation_pct <= 100),
  start_date DATE,
  end_date DATE,
  UNIQUE(project_id, user_id)
);

CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
  code TEXT,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('todo','in_progress','blocked','done')),
  estimate_hours NUMERIC(10,2),
  priority INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(id, project_id)
);

CREATE TABLE timesheets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  week_start_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft','submitted','approved','rejected')),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by BIGINT REFERENCES users(id),
  UNIQUE(user_id, week_start_date)
);

CREATE TABLE time_entries (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id),
  project_id BIGINT NOT NULL REFERENCES projects(id),
  task_id BIGINT,
  user_id BIGINT NOT NULL REFERENCES users(id),
  timesheet_id BIGINT REFERENCES timesheets(id) DEFERRABLE INITIALLY DEFERRED,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT GENERATED ALWAYS AS ((EXTRACT(EPOCH FROM (ended_at - started_at)) / 60)::INT) STORED,
  description TEXT,
  billable BOOLEAN NOT NULL DEFAULT TRUE,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected')),
  approved_by BIGINT REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  invoice_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_time_positive CHECK (ended_at > started_at),
  CONSTRAINT chk_duration_day CHECK (duration_minutes > 0 AND duration_minutes <= 24*60),
  CONSTRAINT fk_time_task_project FOREIGN KEY (task_id, project_id) REFERENCES tasks(id, project_id)
);


