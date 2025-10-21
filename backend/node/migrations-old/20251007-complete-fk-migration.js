'use strict';

/**
 * Migración: Completar redirección de FK restantes a user_profiles
 * 
 * Tablas pendientes:
 * - frequency, gym_payment, streak, transaction, user_gym, user_routine
 * 
 * (progress, refresh_token y routine ya migradas)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Completando migración de FK restantes...\n');
      
      // Crear mapeo
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
      
      // Tablas restantes
      const tables = [
        { name: 'frequency', column: 'id_user' },
        { name: 'gym_payment', column: 'id_user' },
        { name: 'streak', column: 'id_user' },
        { name: 'transaction', column: 'id_user' },
        { name: 'user_gym', column: 'id_user' },
        { name: 'user_routine', column: 'id_user' }
      ];
      
      for (const table of tables) {
        // Verificar si ya está migrada
        const [fkCheck] = await queryInterface.sequelize.query(
          `SELECT CONSTRAINT_NAME 
           FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
           WHERE TABLE_NAME = '${table.name}'
             AND TABLE_SCHEMA = DATABASE()
             AND REFERENCED_TABLE_NAME = 'user'`,
          { transaction }
        );
        
        if (fkCheck.length === 0) {
          console.log(`⏭️  ${table.name}: Ya migrada, saltando\n`);
          continue;
        }
        
        console.log(`📋 Procesando tabla: ${table.name}`);
        const fkName = fkCheck[0].CONSTRAINT_NAME;
        
        // 1. Eliminar FK
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${table.name}\` DROP FOREIGN KEY \`${fkName}\``,
          { transaction }
        );
        console.log(`  ✅ FK antigua eliminada: ${fkName}`);
        
        // 2. Crear columna temporal
        const tempColumn = `${table.column}_new`;
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${table.name}\` ADD COLUMN \`${tempColumn}\` INT NULL`,
          { transaction }
        );
        console.log(`  ✅ Columna temporal creada`);
        
        // 3. Mapear valores
        for (const [oldId, newId] of Object.entries(mapping)) {
          await queryInterface.sequelize.query(
            `UPDATE \`${table.name}\` 
             SET \`${tempColumn}\` = ? 
             WHERE \`${table.column}\` = ?`,
            { replacements: [newId, oldId], transaction }
          );
        }
        console.log(`  ✅ Datos mapeados`);
        
        // 4. Verificar NULLs
        const [[nullCheck]] = await queryInterface.sequelize.query(
          `SELECT COUNT(*) as count 
           FROM \`${table.name}\` 
           WHERE \`${tempColumn}\` IS NULL AND \`${table.column}\` IS NOT NULL`,
          { transaction }
        );
        
        if (nullCheck.count > 0) {
          console.warn(`  ⚠️  ${nullCheck.count} registros sin mapeo en ${table.name}`);
        }
        
        // 5. Eliminar columna antigua
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${table.name}\` DROP COLUMN \`${table.column}\``,
          { transaction }
        );
        console.log(`  ✅ Columna antigua eliminada`);
        
        // 6. Renombrar columna
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
        console.log(`  ✅ Columna renombrada (${nullability})`);
        
        // 7. Crear FK
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
        console.log(`  ✅ Nueva FK creada: ${newFkName}\n`);
      }
      
      await transaction.commit();
      
      console.log('========================================');
      console.log('✅ MIGRACIÓN COMPLETADA');
      console.log('========================================\n');
      
    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ Error:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  Reversión no implementada (usar backup)');
  }
};

