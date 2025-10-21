'use strict';

/**
 * Migración: Redirigir Foreign Keys de user a user_profiles
 * 
 * Esta migración actualiza todas las tablas de dominio para que apunten
 * a user_profiles.id_user_profile en lugar de user.id_user.
 * 
 * Tablas afectadas (11 total):
 * - assistance
 * - claimed_reward
 * - frequency
 * - gym_payment
 * - progress
 * - refresh_token
 * - routine (created_by)
 * - streak
 * - transaction
 * - user_gym
 * - user_routine
 * 
 * Estrategia:
 * 1. Para cada tabla:
 *    a. Eliminar constraint de FK antigua
 *    b. Crear columna temporal con el nuevo ID
 *    c. Mapear user.id_user → user_profiles.id_user_profile
 *    d. Eliminar columna antigua
 *    e. Renombrar columna temporal a nombre original
 *    f. Crear nueva FK a user_profiles
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Iniciando redirección de Foreign Keys a user_profiles...\n');
      
      // Crear mapeo: user.id_user → user_profiles.id_user_profile
      console.log('📊 Creando mapeo user → user_profiles...');
      const [userMapping] = await queryInterface.sequelize.query(
        `SELECT u.id_user, up.id_user_profile 
         FROM user u
         JOIN accounts a ON u.email = a.email
         JOIN user_profiles up ON a.id_account = up.id_account`,
        { transaction }
      );
      
      const mapping = {};
      userMapping.forEach(row => {
        mapping[row.id_user] = row.id_user_profile;
      });
      
      console.log(`✅ Mapeo creado: ${Object.keys(mapping).length} usuarios\n`);
      
      // Lista de tablas potencialmente a actualizar
      const potentialTables = [
        { name: 'frequency', column: 'id_user', fkName: 'frequency_ibfk_1' },
        { name: 'gym_payment', column: 'id_user', fkName: 'gym_payment_ibfk_1' },
        { name: 'progress', column: 'id_user', fkName: 'progress_ibfk_1' },
        { name: 'refresh_token', column: 'id_user', fkName: 'refresh_token_ibfk_1' },
        { name: 'routine', column: 'created_by', fkName: 'fk_routine_creator' },
        { name: 'streak', column: 'id_user', fkName: 'streak_ibfk_1' },
        { name: 'transaction', column: 'id_user', fkName: 'fk_transaction_user' },
        { name: 'user_gym', column: 'id_user', fkName: 'user_gym_ibfk_1' },
        { name: 'user_routine', column: 'id_user', fkName: 'user_routine_ibfk_1' }
      ];
      
      // Filtrar solo las tablas que realmente tienen FK a user
      const tables = [];
      for (const table of potentialTables) {
        const [fkCheck] = await queryInterface.sequelize.query(
          `SELECT CONSTRAINT_NAME 
           FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
           WHERE TABLE_NAME = '${table.name}'
             AND TABLE_SCHEMA = DATABASE()
             AND REFERENCED_TABLE_NAME = 'user'
             AND COLUMN_NAME = '${table.column}'`,
          { transaction }
        );
        
        if (fkCheck.length > 0) {
          tables.push({ ...table, fkName: fkCheck[0].CONSTRAINT_NAME });
        }
      }
      
      console.log(`✅ Tablas a migrar: ${tables.length}/${potentialTables.length}\n`);
      
      if (tables.length === 0) {
        console.log('🔍 No hay tablas pendientes de migración');
        await transaction.commit();
        return;
      }
      
      for (const table of tables) {
        console.log(`🔍 Procesando tabla: ${table.name}`);

        try {
          // Caso especial: eliminar datos de administradores (no tienen user_profiles)
          const adminOnlyTables = ['refresh_token', 'streak', 'frequency', 'user_gym', 'user_routine', 'transaction'];

          if (adminOnlyTables.includes(table.name)) {
            const [adminData] = await queryInterface.sequelize.query(
              `SELECT COUNT(*) as count FROM \`${table.name}\` t
               JOIN user u ON t.\`${table.column}\` = u.id_user
               WHERE u.subscription = 'ADMIN'`,
              { transaction }
            );

            if (adminData[0].count > 0) {
              console.log(`  → Eliminando ${adminData[0].count} registros de administradores...`);

              if (table.name === 'streak') {
                console.log('  → Liberando referencias user.id_streak para administradores');
                await queryInterface.sequelize.query(
                  `UPDATE user
                   SET id_streak = NULL
                   WHERE subscription = 'ADMIN' AND id_streak IS NOT NULL`,
                  { transaction }
                );
              }

              await queryInterface.sequelize.query(
                `DELETE FROM \`${table.name}\`
                 WHERE \`${table.column}\` IN (SELECT id_user FROM user WHERE subscription = 'ADMIN')`,
                { transaction }
              );
              console.log('  → Registros de admin eliminados');
            }
          }
          // 1. Eliminar FK constraint antigua
          await queryInterface.sequelize.query(
            `ALTER TABLE \`${table.name}\` DROP FOREIGN KEY \`${table.fkName}\``,
            { transaction }
          );
          console.log(`  ✅ FK antigua eliminada: ${table.fkName}`);
          
          // 2. Agregar columna temporal
          const tempColumn = `${table.column}_new`;
          await queryInterface.sequelize.query(
            `ALTER TABLE \`${table.name}\` ADD COLUMN \`${tempColumn}\` INT NULL`,
            { transaction }
          );
          console.log(`  ✅ Columna temporal creada: ${tempColumn}`);
          
          // 3. Mapear valores antiguos a nuevos
          for (const [oldId, newId] of Object.entries(mapping)) {
            await queryInterface.sequelize.query(
              `UPDATE \`${table.name}\` 
               SET \`${tempColumn}\` = ? 
               WHERE \`${table.column}\` = ?`,
              { replacements: [newId, oldId], transaction }
            );
          }
          console.log(`  ✅ Datos mapeados correctamente`);
          
          // 4. Verificar que no haya NULLs inesperados
          const [[nullCheck]] = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count 
             FROM \`${table.name}\` 
             WHERE \`${tempColumn}\` IS NULL AND \`${table.column}\` IS NOT NULL`,
            { transaction }
          );
          
          if (nullCheck.count > 0) {
            throw new Error(`🔍 ${nullCheck.count} registros en ${table.name} no pudieron ser mapeados`);
          }
          
          // 5. Eliminar columna antigua
          await queryInterface.sequelize.query(
            `ALTER TABLE \`${table.name}\` DROP COLUMN \`${table.column}\``,
            { transaction }
          );
          console.log(`  ✅ Columna antigua eliminada: ${table.column}`);
          
          // 6. Renombrar columna temporal
          // Verificar si hay NULLs para decidir si permite NULL
          const [[hasNulls]] = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count 
             FROM \`${table.name}\` 
             WHERE \`${tempColumn}\` IS NULL`,
            { transaction }
          );
          
          const nullability = hasNulls.count > 0 ? 'NULL' : 'NOT NULL';
          
          await queryInterface.sequelize.query(
            `ALTER TABLE \`${table.name}\` 
             CHANGE COLUMN \`${tempColumn}\` \`${table.column}\` INT ${nullability}`,
            { transaction }
          );
          console.log(`  ✅ Columna renombrada: ${tempColumn} → ${table.column} (${nullability})`);
          
          // 7. Crear nueva FK a user_profiles
          const newFkName = `fk_${table.name}_user_profile`;
          await queryInterface.sequelize.query(
            `ALTER TABLE \`${table.name}\` 
             ADD CONSTRAINT \`${newFkName}\` 
             FOREIGN KEY (\`${table.column}\`) 
             REFERENCES \`user_profiles\` (\`id_user_profile\`) 
             ON DELETE CASCADE 
             ON UPDATE CASCADE`,
            { transaction }
          );
          console.log(`  ✅ Nueva FK creada: ${newFkName}`);
          console.log(`  ✅ Tabla ${table.name} actualizada correctamente\n`);
          
        } catch (error) {
          console.error(`  ❌ Error en tabla ${table.name}:`, error.message);
          throw error;
        }
      }
      
      await transaction.commit();
      
      console.log('========================================');
      console.log('✅ REDIRECCIÓN COMPLETADA');
      console.log('========================================');
      console.log(`📊 ${tables.length} tablas actualizadas`);
      console.log('✅ Todas las FKs apuntan a user_profiles');
      console.log('========================================\n');
      
    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ Error en migración:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Revirtiendo redirección de FKs...\n');
      
      // Crear mapeo inverso: user_profiles.id_user_profile → user.id_user
      const [userMapping] = await queryInterface.sequelize.query(
        `SELECT u.id_user, up.id_user_profile 
         FROM user u
         JOIN accounts a ON u.email = a.email
         JOIN user_profiles up ON a.id_account = up.id_account`,
        { transaction }
      );
      
      const mapping = {};
      userMapping.forEach(row => {
        mapping[row.id_user_profile] = row.id_user;
      });
      
      const tables = [
        { name: 'assistance', column: 'id_user', newFkName: 'fk_assistance_user_profile', oldFkName: 'assistance_ibfk_1' },
        { name: 'claimed_reward', column: 'id_user', newFkName: 'fk_claimed_reward_user_profile', oldFkName: 'claimed_reward_ibfk_1' },
        { name: 'frequency', column: 'id_user', newFkName: 'fk_frequency_user_profile', oldFkName: 'frequency_ibfk_1' },
        { name: 'gym_payment', column: 'id_user', newFkName: 'fk_gym_payment_user_profile', oldFkName: 'gym_payment_ibfk_1' },
        { name: 'progress', column: 'id_user', newFkName: 'fk_progress_user_profile', oldFkName: 'progress_ibfk_1' },
        { name: 'refresh_token', column: 'id_user', newFkName: 'fk_refresh_token_user_profile', oldFkName: 'refresh_token_ibfk_1' },
        { name: 'routine', column: 'created_by', newFkName: 'fk_routine_user_profile', oldFkName: 'fk_routine_creator' },
        { name: 'streak', column: 'id_user', newFkName: 'fk_streak_user_profile', oldFkName: 'streak_ibfk_1' },
        { name: 'transaction', column: 'id_user', newFkName: 'fk_transaction_user_profile', oldFkName: 'fk_transaction_user' },
        { name: 'user_gym', column: 'id_user', newFkName: 'fk_user_gym_user_profile', oldFkName: 'user_gym_ibfk_1' },
        { name: 'user_routine', column: 'id_user', newFkName: 'fk_user_routine_user_profile', oldFkName: 'user_routine_ibfk_1' }
      ];
      
      for (const table of tables) {
        console.log(`🔍 Revirtiendo tabla: ${table.name}`);
        
        // Eliminar FK nueva
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${table.name}\` DROP FOREIGN KEY \`${table.newFkName}\``,
          { transaction }
        );
        
        // Agregar columna temporal
        const tempColumn = `${table.column}_old`;
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${table.name}\` ADD COLUMN \`${tempColumn}\` INT NULL`,
          { transaction }
        );
        
        // Mapear valores nuevos a antiguos
        for (const [newId, oldId] of Object.entries(mapping)) {
          await queryInterface.sequelize.query(
            `UPDATE \`${table.name}\` 
             SET \`${tempColumn}\` = ? 
             WHERE \`${table.column}\` = ?`,
            { replacements: [oldId, newId], transaction }
          );
        }
        
        // Eliminar columna nueva
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${table.name}\` DROP COLUMN \`${table.column}\``,
          { transaction }
        );
        
        // Renombrar columna temporal
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${table.name}\` 
           CHANGE COLUMN \`${tempColumn}\` \`${table.column}\` INT NOT NULL`,
          { transaction }
        );
        
        // Recrear FK antigua
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${table.name}\` 
           ADD CONSTRAINT \`${table.oldFkName}\` 
           FOREIGN KEY (\`${table.column}\`) 
           REFERENCES \`user\` (\`id_user\`) 
           ON DELETE CASCADE 
           ON UPDATE CASCADE`,
          { transaction }
        );
        
        console.log(`  ✅ Tabla ${table.name} revertida\n`);
      }
      
      await transaction.commit();
      console.log('✅ Reversión completada\n');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al revertir:', error);
      throw error;
    }
  }
};

