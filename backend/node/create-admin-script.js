/**
 * Script para crear administrador de forma programática
 * 
 * Uso:
 *   node create-admin-script.js <email> <password> <nombre> <apellido> [departamento] [notas]
 * 
 * Ejemplo:
 *   node create-admin-script.js admin2@gympoint.com Admin123 Maria Gonzalez IT "Administradora principal"
 */

const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function createAdminScript(email, password, name, lastname, department = 'System', notes = '') {
  try {
    console.log('\n========================================');
    console.log('  CREAR ADMINISTRADOR (Script)');
    console.log('========================================\n');
    
    // Validaciones
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }
    
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (!name || !lastname) {
      throw new Error('Nombre y apellido son obligatorios');
    }
    
    // Verificar si el email ya existe
    const existing = await db.query(
      'SELECT id_account FROM accounts WHERE email = ?',
      { replacements: [email], type: db.QueryTypes.SELECT }
    );
    
    if (existing && existing.length > 0) {
      throw new Error(`El email ${email} ya está registrado`);
    }
    
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Nombre: ${name} ${lastname}`);
    console.log(`🏢 Departamento: ${department}`);
    console.log('');
    
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('✅ Contraseña hasheada');
    
    // Crear account
    const accountResult = await db.query(
      `INSERT INTO accounts 
       (email, password_hash, auth_provider, email_verified, is_active, created_at, updated_at)
       VALUES (?, ?, 'local', true, true, NOW(), NOW())`,
      { replacements: [email, passwordHash], type: db.QueryTypes.INSERT }
    );
    
    const accountId = accountResult[0]; // INSERT devuelve [insertId, affectedRows]
    console.log(`✅ Account creado (ID: ${accountId})`);
    
    // Asignar rol ADMIN (id_role = 2)
    await db.query(
      `INSERT INTO account_roles (id_account, id_role, assigned_at)
       VALUES (?, 2, NOW())`,
      { replacements: [accountId], type: db.QueryTypes.INSERT }
    );
    console.log('✅ Rol ADMIN asignado');
    
    // Crear admin_profile
    await db.query(
      `INSERT INTO admin_profiles 
       (id_account, name, lastname, department, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      { replacements: [accountId, name, lastname, department, notes], type: db.QueryTypes.INSERT }
    );
    console.log('✅ Admin profile creado');
    
    console.log('\n========================================');
    console.log('  ✅ ADMINISTRADOR CREADO EXITOSAMENTE');
    console.log('========================================\n');
    console.log(`🔢 Account ID: ${accountId}`);
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Nombre completo: ${name} ${lastname}`);
    console.log(`🏢 Departamento: ${department}`);
    console.log(`🎭 Rol: ADMIN`);
    
    if (notes) {
      console.log(`📝 Notas: ${notes}`);
    }
    
    console.log('\n✅ Puede iniciar sesión ahora\n');
    
    return { accountId, email, name, lastname, department };
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await db.close();
  }
}

// Ejecutar si es llamado directamente desde línea de comandos
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.error('\n❌ Uso: node create-admin-script.js <email> <password> <nombre> <apellido> [departamento] [notas]\n');
    console.error('Ejemplo:');
    console.error('  node create-admin-script.js admin2@gympoint.com Admin123 Maria Gonzalez IT "Administradora principal"\n');
    process.exit(1);
  }
  
  const [email, password, name, lastname, department, notes] = args;
  
  createAdminScript(email, password, name, lastname, department, notes)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { createAdminScript };

