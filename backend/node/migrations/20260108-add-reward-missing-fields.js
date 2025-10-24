'use strict';

/**
 * MIGRACIÓN 8: Agregar campos faltantes a tabla reward
 *
 * Esta migración agrega los campos que estaban definidos en el schema OpenAPI
 * pero faltaban en la base de datos:
 * - reward_type: Tipo de recompensa (ENUM)
 * - image_url: URL de la imagen de la recompensa
 * - terms: Términos y condiciones de la recompensa
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('⚙️  [8/8] Agregando campos faltantes a tabla reward...\n');

      // ========================================
      // AGREGAR COLUMNA: reward_type
      // ========================================
      console.log('📝 Agregando columna "reward_type"...');
      await queryInterface.addColumn(
        'reward',
        'reward_type',
        {
          type: Sequelize.ENUM(
            'descuento',
            'pase_gratis',
            'producto',
            'servicio',
            'merchandising',
            'otro'
          ),
          allowNull: true,
          after: 'description',
          comment: 'Tipo de recompensa: descuento, pase_gratis, producto, servicio, merchandising, otro'
        },
        { transaction }
      );
      console.log('✅ Columna "reward_type" agregada\n');

      // ========================================
      // AGREGAR COLUMNA: image_url
      // ========================================
      console.log('📝 Agregando columna "image_url"...');
      await queryInterface.addColumn(
        'reward',
        'image_url',
        {
          type: Sequelize.STRING(500),
          allowNull: true,
          after: 'is_active',
          comment: 'URL de la imagen de la recompensa'
        },
        { transaction }
      );
      console.log('✅ Columna "image_url" agregada\n');

      // ========================================
      // AGREGAR COLUMNA: terms
      // ========================================
      console.log('📝 Agregando columna "terms"...');
      await queryInterface.addColumn(
        'reward',
        'terms',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'image_url',
          comment: 'Términos y condiciones de la recompensa'
        },
        { transaction }
      );
      console.log('✅ Columna "terms" agregada\n');

      // ========================================
      // AGREGAR ÍNDICE: reward_type
      // ========================================
      console.log('📝 Agregando índice para "reward_type"...');
      await queryInterface.addIndex('reward', ['reward_type'], {
        name: 'idx_reward_type',
        transaction
      });
      console.log('✅ Índice "idx_reward_type" agregado\n');

      await transaction.commit();
      console.log('✅ Migración completada exitosamente\n');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migración:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('⚙️  Revirtiendo cambios en tabla reward...\n');

      // Eliminar índice
      console.log('📝 Eliminando índice "idx_reward_type"...');
      await queryInterface.removeIndex('reward', 'idx_reward_type', { transaction });
      console.log('✅ Índice eliminado\n');

      // Eliminar columnas en orden inverso
      console.log('📝 Eliminando columna "terms"...');
      await queryInterface.removeColumn('reward', 'terms', { transaction });
      console.log('✅ Columna "terms" eliminada\n');

      console.log('📝 Eliminando columna "image_url"...');
      await queryInterface.removeColumn('reward', 'image_url', { transaction });
      console.log('✅ Columna "image_url" eliminada\n');

      console.log('📝 Eliminando columna "reward_type"...');
      await queryInterface.removeColumn('reward', 'reward_type', { transaction });
      console.log('✅ Columna "reward_type" eliminada\n');

      await transaction.commit();
      console.log('✅ Rollback completado exitosamente\n');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en rollback:', error.message);
      throw error;
    }
  }
};
