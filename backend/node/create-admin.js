const db = require('./config/database');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('\n========================================');
    console.log('  CREAR NUEVO ADMINISTRADOR');
    console.log('========================================\n');
    
    // 1. Solicitar datos del admin
    const email = await question('📧 Email del admin: ');
    
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }
    
    // Verificar si el email ya existe
    const [[existing]] = await db.query(
      'SELECT id_account FROM accounts WHERE email = ?',
      [email]
    );
    
    if (existing) {
      throw new Error(`El email ${email} ya está registrado`);
    }
    
    const password = await question('🔒 Contraseña: ');
    
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    const name = await question('👤 Nombre: ');
    const lastname = await question('👤 Apellido: ');
    const department = await question('🏢 Departamento (ej: IT, Support, Management): ') || 'System';
    const notes = await question('📝 Notas (opcional): ') || '';
    
    rl.close();
    
    console.log('\n🔄 Creando administrador...\n');
    
    // 2. Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('✅ Contraseña hasheada');
    
    // 3. Crear account
    const [accountResult] = await db.query(
      `INSERT INTO accounts 
       (email, password_hash, auth_provider, email_verified, is_active, created_at, updated_at)
       VALUES (?, ?, 'local', true, true, NOW(), NOW())`,
      [email, passwordHash]
    );
    
    const accountId = accountResult.insertId;
    console.log(`✅ Account creado (ID: ${accountId})`);
    
    // 4. Asignar rol ADMIN
    await db.query(
      `INSERT INTO account_roles (id_account, id_role, assigned_at)
       VALUES (?, 2, NOW())`,
      [accountId]
    );
    console.log('✅ Rol ADMIN asignado');
    
    // 5. Crear admin_profile
    await db.query(
      `INSERT INTO admin_profiles 
       (id_account, name, lastname, department, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [accountId, name, lastname, department, notes]
    );
    console.log('✅ Admin profile creado');
    
    // 6. Mostrar resumen
    console.log('\n========================================');
    console.log('  ADMINISTRADOR CREADO EXITOSAMENTE');
    console.log('========================================\n');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Nombre: ${name} ${lastname}`);
    console.log(`🏢 Departamento: ${department}`);
    console.log(`🔢 Account ID: ${accountId}`);
    console.log(`🎭 Rol: ADMIN`);
    
    if (notes) {
      console.log(`📝 Notas: ${notes}`);
    }
    
    console.log('\n✅ El administrador puede iniciar sesión ahora\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createAdmin();
}

module.exports = { createAdmin };

