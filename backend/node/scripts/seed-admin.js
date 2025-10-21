/**
 * Script para crear usuario administrador inicial
 * Este script se ejecuta automáticamente cuando se levanta Docker
 * Solo para desarrollo - eliminar en producción
 */

const { Account, Role, AccountRole, AdminProfile } = require('../models');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'admin@gympoint.com';
const ADMIN_PASSWORD = 'AdminGPMitre280!';

async function seedAdmin() {
  try {
    console.log(' Verificando si existe el usuario admin...');

    // Verificar si ya existe
    const existingAdmin = await Account.findOne({
      where: { email: ADMIN_EMAIL }
    });

    if (existingAdmin) {
      console.log(' Usuario admin ya existe:', ADMIN_EMAIL);
      return;
    }

    console.log(' Creando usuario admin inicial...');

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Crear transacción
    const result = await sequelize.transaction(async (t) => {
      // 1. Crear cuenta
      const account = await Account.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        is_active: true
      }, { transaction: t });

      // 2. Obtener o crear rol ADMIN
      let adminRole = await Role.findOne({
        where: { role_name: 'ADMIN' },
        transaction: t
      });

      if (!adminRole) {
        adminRole = await Role.create({
          role_name: 'ADMIN',
          description: 'Administrator role with full access'
        }, { transaction: t });
      }

      // 3. Asignar rol
      await AccountRole.create({
        id_account: account.id_account,
        id_role: adminRole.id_role
      }, { transaction: t });

      // 4. Crear perfil de admin
      await AdminProfile.create({
        id_account: account.id_account,
        name: 'Admin',
        lastname: 'GymPoint',
        department: 'IT',
        notes: 'Usuario administrador inicial creado automáticamente'
      }, { transaction: t });

      return account;
    });

    console.log(' Usuario admin creado exitosamente!');
    console.log(' Email:', ADMIN_EMAIL);
    console.log(' Password: AdminGPMitre280!');
    console.log('  IMPORTANTE: Cambiar la contraseña en producción\n');

  } catch (error) {
    console.error(' Error creando usuario admin:', error.message);
    throw error;
  }
}

// Ejecutar seed
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log(' Seed completado');
      process.exit(0);
    })
    .catch(err => {
      console.error(' Error en seed:', err);
      process.exit(1);
    });
}

module.exports = { seedAdmin };
