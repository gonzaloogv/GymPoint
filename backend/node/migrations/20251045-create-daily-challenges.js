'use strict';

/**
 * Migración: Desafíos diarios simples (Fase 1.2)
 *
 * Crea tablas daily_challenge y user_daily_challenge
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Crear daily_challenge
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS daily_challenge (
          id_challenge INT PRIMARY KEY AUTO_INCREMENT,
          challenge_date DATE NOT NULL UNIQUE,
          title VARCHAR(100) NOT NULL,
          description TEXT,
          challenge_type ENUM('MINUTES', 'EXERCISES', 'FREQUENCY') NOT NULL,
          target_value INT NOT NULL,
          target_unit VARCHAR(20),
          tokens_reward INT DEFAULT 10,
          difficulty VARCHAR(20) DEFAULT 'MEDIUM',
          is_active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_active_date (challenge_date, is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `, { transaction });

      // Crear user_daily_challenge
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS user_daily_challenge (
          id_user_profile INT NOT NULL,
          id_challenge INT NOT NULL,
          progress INT DEFAULT 0,
          completed BOOLEAN DEFAULT FALSE,
          completed_at DATETIME NULL,
          tokens_earned INT DEFAULT 0,
          PRIMARY KEY (id_user_profile, id_challenge),
          CONSTRAINT fk_udc_user FOREIGN KEY (id_user_profile) REFERENCES user_profiles(id_user_profile) ON DELETE CASCADE,
          CONSTRAINT fk_udc_ch FOREIGN KEY (id_challenge) REFERENCES daily_challenge(id_challenge) ON DELETE CASCADE,
          INDEX idx_completed (id_user_profile, completed, completed_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `, { transaction });

      await transaction.commit();
      console.log('✓ Tablas de desafíos diarios creadas');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error creando tablas de desafíos diarios:', error.message);
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS user_daily_challenge;', { transaction });
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS daily_challenge;', { transaction });
      await transaction.commit();
      console.log('✓ Tablas de desafíos diarios eliminadas');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error eliminando tablas de desafíos diarios:', error.message);
      throw error;
    }
  }
};

