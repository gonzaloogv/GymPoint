-- =====================================================
-- GYMPOINT - ESQUEMA DE BASE DE DATOS v2.0
-- Arquitectura: Separación de Autenticación y Perfiles
-- =====================================================

-- =====================================================
-- CAPA 1: AUTENTICACIÓN
-- =====================================================

CREATE TABLE accounts (
  id_account INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la cuenta',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email para login',
  password_hash VARCHAR(255) NULL COMMENT 'Hash de contraseña (NULL si OAuth)',
  auth_provider ENUM('local', 'google') NOT NULL DEFAULT 'local',
  google_id VARCHAR(255) NULL UNIQUE COMMENT 'ID de Google OAuth',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Cuenta activa (no baneada)',
  last_login DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_google_id (google_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cuentas y autenticación';

CREATE TABLE roles (
  id_role INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE COMMENT 'USER, ADMIN, GYM_OWNER, etc.',
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de roles del sistema';

CREATE TABLE account_roles (
  id_account_role INT AUTO_INCREMENT PRIMARY KEY,
  id_account INT NOT NULL,
  id_role INT NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_account) REFERENCES accounts(id_account) ON DELETE CASCADE,
  FOREIGN KEY (id_role) REFERENCES roles(id_role) ON DELETE CASCADE,
  UNIQUE KEY unique_account_role (id_account, id_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='RBAC: Roles asignados a cuentas';

-- =====================================================
-- CAPA 2: PERFILES DE DOMINIO
-- =====================================================

CREATE TABLE user_profiles (
  id_user_profile INT AUTO_INCREMENT PRIMARY KEY,
  id_account INT NOT NULL UNIQUE COMMENT 'Relación 1:1 con account',
  name VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  gender ENUM('M', 'F', 'O') NOT NULL DEFAULT 'O',
  age TINYINT NULL,
  locality VARCHAR(100) NULL,
  subscription ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE',
  tokens INT NOT NULL DEFAULT 0,
  id_streak INT NULL COMMENT 'FK a streak',
  profile_picture_url VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_account) REFERENCES accounts(id_account) ON DELETE CASCADE,
  INDEX idx_subscription (subscription),
  INDEX idx_tokens (tokens)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Perfil de usuarios de la app móvil';

CREATE TABLE admin_profiles (
  id_admin_profile INT AUTO_INCREMENT PRIMARY KEY,
  id_account INT NOT NULL UNIQUE COMMENT 'Relación 1:1 con account',
  name VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  department VARCHAR(100) NULL COMMENT 'IT, Support, Management, etc.',
  notes TEXT NULL COMMENT 'Notas internas',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_account) REFERENCES accounts(id_account) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Perfil de administradores del sistema';

-- =====================================================
-- INSERTAR DATOS INICIALES
-- =====================================================

INSERT INTO roles (role_name, description) VALUES
('USER', 'Usuario normal de la aplicación móvil'),
('ADMIN', 'Administrador del sistema con acceso total');

-- =====================================================
-- EJEMPLOS DE USO
-- =====================================================

-- Ejemplo 1: Crear usuario normal (app móvil)
-- INSERT INTO accounts (email, password_hash, auth_provider) 
-- VALUES ('user@example.com', '$2b$12$...', 'local');
--
-- INSERT INTO account_roles (id_account, id_role) 
-- VALUES (LAST_INSERT_ID(), 1); -- 1 = USER
--
-- INSERT INTO user_profiles (id_account, name, lastname, subscription) 
-- VALUES (LAST_INSERT_ID(), 'Juan', 'Pérez', 'FREE');

-- Ejemplo 2: Crear administrador
-- INSERT INTO accounts (email, password_hash, auth_provider) 
-- VALUES ('admin@gympoint.com', '$2b$12$...', 'local');
--
-- INSERT INTO account_roles (id_account, id_role) 
-- VALUES (LAST_INSERT_ID(), 2); -- 2 = ADMIN
--
-- INSERT INTO admin_profiles (id_account, name, lastname, department) 
-- VALUES (LAST_INSERT_ID(), 'María', 'González', 'IT');

-- Ejemplo 3: Login y obtención de perfil
-- SELECT a.*, r.role_name, up.*, ap.*
-- FROM accounts a
-- LEFT JOIN account_roles ar ON a.id_account = ar.id_account
-- LEFT JOIN roles r ON ar.id_role = r.id_role
-- LEFT JOIN user_profiles up ON a.id_account = up.id_account
-- LEFT JOIN admin_profiles ap ON a.id_account = ap.id_account
-- WHERE a.email = 'user@example.com' AND a.is_active = 1;

