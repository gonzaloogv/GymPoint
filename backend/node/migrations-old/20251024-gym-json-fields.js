'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Convirtiendo campos de gym a JSON...\n');

      // 1. Convertir equipment TEXT → JSON
      console.log('   → Convirtiendo equipment...');

      // Obtener datos actuales
      const [gyms] = await queryInterface.sequelize.query(
        `SELECT id_gym, equipment FROM gym`,
        { transaction }
      );

      // Convertir a JSON array
      for (const gym of gyms) {
        let equipmentArray = [];
        if (gym.equipment) {
          // Si es texto separado por comas
          equipmentArray = gym.equipment.split(',').map(e => e.trim());
        }

        await queryInterface.sequelize.query(
          `UPDATE gym SET equipment = ? WHERE id_gym = ?`,
          {
            replacements: [JSON.stringify(equipmentArray), gym.id_gym],
            transaction
          }
        );
      }

      console.log(`   ✓ ${gyms.length} registros de equipment convertidos`);

      // Cambiar tipo de columna a JSON
      await queryInterface.changeColumn('gym', 'equipment', {
        type: Sequelize.JSON,
        allowNull: false
      }, { transaction });

      // 2. Convertir social_media TEXT → JSON
      console.log('   → Convirtiendo social_media...');

      const [gyms2] = await queryInterface.sequelize.query(
        `SELECT id_gym, social_media FROM gym`,
        { transaction }
      );

      for (const gym of gyms2) {
        let socialObj = {};
        if (gym.social_media) {
          try {
            // Intentar parsear como JSON
            socialObj = JSON.parse(gym.social_media);
          } catch (e) {
            // Si no es JSON válido, asumir que es un handle de Instagram
            if (gym.social_media.startsWith('@')) {
              socialObj = { instagram: gym.social_media };
            } else {
              socialObj = { legacy: gym.social_media };
            }
          }
        }

        await queryInterface.sequelize.query(
          `UPDATE gym SET social_media = ? WHERE id_gym = ?`,
          {
            replacements: [JSON.stringify(socialObj), gym.id_gym],
            transaction
          }
        );
      }

      console.log(`   ✓ ${gyms2.length} registros de social_media convertidos`);

      await queryInterface.changeColumn('gym', 'social_media', {
        type: Sequelize.JSON,
        allowNull: true
      }, { transaction });

      await transaction.commit();
      console.log('\n✅ Conversión a JSON completada\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('\n🔧 Revirtiendo campos JSON a TEXT...\n');

      // Convertir JSON de vuelta a TEXT
      const [gyms] = await queryInterface.sequelize.query(
        `SELECT id_gym, equipment, social_media FROM gym`,
        { transaction }
      );

      // Primero cambiar tipo de columna a TEXT
      await queryInterface.changeColumn('gym', 'equipment', {
        type: Sequelize.TEXT,
        allowNull: false
      }, { transaction });

      await queryInterface.changeColumn('gym', 'social_media', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      // Luego convertir datos de vuelta
      for (const gym of gyms) {
        let equipmentText = '';
        let socialText = null;

        if (gym.equipment) {
          const equipArray = typeof gym.equipment === 'string'
            ? JSON.parse(gym.equipment)
            : gym.equipment;
          equipmentText = equipArray.join(', ');
        }

        if (gym.social_media) {
          const socialObj = typeof gym.social_media === 'string'
            ? JSON.parse(gym.social_media)
            : gym.social_media;

          if (socialObj.instagram) {
            socialText = socialObj.instagram;
          } else if (socialObj.legacy) {
            socialText = socialObj.legacy;
          } else {
            socialText = JSON.stringify(socialObj);
          }
        }

        await queryInterface.sequelize.query(
          `UPDATE gym SET equipment = ?, social_media = ? WHERE id_gym = ?`,
          {
            replacements: [equipmentText, socialText, gym.id_gym],
            transaction
          }
        );
      }

      await transaction.commit();
      console.log('\n✅ Reversión completada\n');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
