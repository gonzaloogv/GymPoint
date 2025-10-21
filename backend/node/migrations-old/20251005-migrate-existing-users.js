'use strict';

/**
 * Migración: Datos de Usuarios de tabla 'user' a nueva arquitectura
 * 
 * Esta migración copia los datos existentes de la tabla 'user' antigua
 * a la nueva estructura separada (accounts, user_profiles, admin_profiles).
 * 
 * Mapeo de roles:
 * - USER → account con rol USER + user_profile con subscription FREE
 * - PREMIUM → account con rol USER + user_profile con subscription PREMIUM
 * - ADMIN → account con rol ADMIN + admin_profile
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Iniciando migración de usuarios existentes...\n');
      
      // 1. Obtener todos los usuarios de la tabla antigua
      const [users] = await queryInterface.sequelize.query(
        'SELECT * FROM user ORDER BY id_user',
        { transaction }
      );
      
      console.log(`📊 Usuarios a migrar: ${users.length}\n`);
      
      if (users.length === 0) {
        console.log('⚠️ No hay usuarios para migrar');
        await transaction.commit();
        return;
      }
      
      let userCount = 0;
      let adminCount = 0;
      let skippedCount = 0;
      
      // 2. Procesar cada usuario
      for (const user of users) {
        try {
          console.log(`📝 Procesando usuario #${user.id_user}: ${user.email}`);
          
          // Determinar si es ADMIN o USER (subscription es el campo que contiene el rol)
          const isAdmin = user.subscription === 'ADMIN';
          const isPremium = user.subscription === 'PREMIUM';
          
          // 2.1. Crear account
          const [accountResult] = await queryInterface.sequelize.query(
            `INSERT INTO accounts 
             (email, password_hash, auth_provider, google_id, email_verified, is_active, last_login, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
              replacements: [
                user.email,
                user.password, // ya es hash de bcrypt
                user.auth_provider || 'local',
                user.google_id || null,
                true, // email_verified (asumimos true para usuarios existentes)
                true, // is_active
                null, // last_login
                user.created_at || new Date(),
                user.updated_at || new Date()
              ],
              transaction
            }
          );
          
          const accountId = accountResult;
          console.log(`  ✅ Account creado (ID: ${accountId})`);
          
          // 2.2. Asignar rol (USER o ADMIN)
          const roleId = isAdmin ? 2 : 1; // 1=USER, 2=ADMIN
          await queryInterface.sequelize.query(
            `INSERT INTO account_roles (id_account, id_role, assigned_at)
             VALUES (?, ?, ?)`,
            {
              replacements: [accountId, roleId, new Date()],
              transaction
            }
          );
          console.log(`  ✅ Rol asignado: ${isAdmin ? 'ADMIN' : 'USER'}`);
          
          // 2.3. Crear perfil según el rol
          if (isAdmin) {
            // Crear admin_profile
            await queryInterface.sequelize.query(
              `INSERT INTO admin_profiles 
               (id_account, name, lastname, department, notes, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              {
                replacements: [
                  accountId,
                  user.name || 'Admin',
                  user.lastname || '',
                  'System', // department por defecto
                  `Migrado desde user #${user.id_user}`,
                  user.created_at || new Date(),
                  user.updated_at || new Date()
                ],
                transaction
              }
            );
            console.log(`  ✅ Admin profile creado`);
            adminCount++;
            
          } else {
            // Crear user_profile
            const subscription = isPremium ? 'PREMIUM' : 'FREE';
            
            await queryInterface.sequelize.query(
              `INSERT INTO user_profiles 
               (id_account, name, lastname, gender, age, locality, subscription, tokens, id_streak, profile_picture_url, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              {
                replacements: [
                  accountId,
                  user.name || 'Usuario',
                  user.lastname || '',
                  user.gender || 'O',
                  user.age || null,
                  user.locality || null,
                  subscription,
                  user.tokens || 0,
                  user.id_streak || null,
                  null, // profile_picture_url
                  user.created_at || new Date(),
                  user.updated_at || new Date()
                ],
                transaction
              }
            );
            console.log(`  ✅ User profile creado (subscription: ${subscription})`);
            userCount++;
          }
          
          console.log(`  ✅ Usuario migrado exitosamente\n`);
          
        } catch (error) {
          console.error(`  ❌ Error migrando usuario #${user.id_user}:`, error.message);
          skippedCount++;
          // Continuar con el siguiente usuario
        }
      }
      
      await transaction.commit();
      
      console.log('\n========================================');
      console.log('✅ MIGRACIÓN COMPLETADA');
      console.log('========================================');
      console.log(`📊 Total procesados: ${users.length}`);
      console.log(`👥 Usuarios (app): ${userCount}`);
      console.log(`🔧 Administradores: ${adminCount}`);
      console.log(`⚠️ Saltados (errores): ${skippedCount}`);
      console.log('========================================\n');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migración de usuarios:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Revirtiendo migración de usuarios...\n');
      
      // Obtener emails de usuarios originales
      const [users] = await queryInterface.sequelize.query(
        'SELECT email FROM user',
        { transaction }
      );
      
      if (users.length === 0) {
        console.log('⚠️ No hay usuarios en tabla original para revertir');
        await transaction.commit();
        return;
      }
      
      const emails = users.map(u => u.email);
      const placeholders = emails.map(() => '?').join(',');
      
      // Eliminar accounts (cascada eliminará profiles y roles)
      await queryInterface.sequelize.query(
        `DELETE FROM accounts WHERE email IN (${placeholders})`,
        {
          replacements: emails,
          transaction
        }
      );
      
      console.log(`✅ ${users.length} cuentas migradas eliminadas\n`);
      
      await transaction.commit();
      console.log('✅ Migración revertida exitosamente\n');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al revertir migración:', error);
      throw error;
    }
  }
};

