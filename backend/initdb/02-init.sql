-- Criar organização inicial (se não existir)
INSERT IGNORE INTO organizations (id, name)
VALUES (1, 'Default Organization');

-- Criar usuário admin com senha em branco (se não existir)
INSERT IGNORE INTO users (
  organization_id,
  name,
  email,
  password_hash,
  role,
  hourly_rate,
  active
) VALUES (
  1,
  'admin',
  'admin@example.com',
  '$2b$12$3uMGtFSiifBFyNolqomN5.G.yAbQWLwv0/1EdcvcC5sBw2Mi2.C0u',
  'admin',
  NULL,
  1
);
