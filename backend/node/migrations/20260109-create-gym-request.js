'use strict';

/**
 * MIGRACIÓN: Gym Request Table
 *
 * Esta migración crea la tabla gym_request para almacenar solicitudes
 * de registro de gimnasios desde la landing page.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 Creando tabla gym_request...\n');

      // Crear tabla sin foreign keys primero
      await queryInterface.createTable('gym_request', {
        id_gym_request: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        // Información básica
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Nombre del gimnasio'
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Descripción del gimnasio'
        },
        // Ubicación
        city: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: 'Ciudad'
        },
        address: {
          type: Sequelize.STRING(200),
          allowNull: false,
          comment: 'Dirección física'
        },
        latitude: {
          type: Sequelize.DECIMAL(10, 8),
          allowNull: true,
          comment: 'Latitud geográfica'
        },
        longitude: {
          type: Sequelize.DECIMAL(11, 8),
          allowNull: true,
          comment: 'Longitud geográfica'
        },
        // Contacto
        phone: {
          type: Sequelize.STRING(20),
          allowNull: true,
          comment: 'Teléfono de contacto'
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Email de contacto'
        },
        website: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Sitio web'
        },
        // Redes sociales
        instagram: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Usuario de Instagram'
        },
        facebook: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Página de Facebook'
        },
        // Fotos
        photos: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'URLs de fotos del gimnasio'
        },
        // Equipment categorizado por tipo
        equipment: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: '{}',
          comment: 'Equipamiento categorizado: { "fuerza": [{ "name": "Banco press", "quantity": 4 }], "cardio": [...] }'
        },
        // Services / Tipos de entrenamiento
        services: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: '[]',
          comment: 'Servicios/tipos ofrecidos: ["Funcional", "CrossFit", "Musculación"]'
        },
        // Reglas del gimnasio
        rules: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: '[]',
          comment: 'Reglas del gimnasio'
        },
        // Precios
        monthly_price: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          comment: 'Precio mensual'
        },
        weekly_price: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          comment: 'Precio semanal'
        },
        daily_price: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          comment: 'Precio diario'
        },
        trial_allowed: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si permite pase de dia gratis'
        },
        // Horarios
        schedule: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Horarios de atención por día'
        },
        // Amenidades
        amenities: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Amenidades y servicios del gimnasio'
        },
        // Estado de la solicitud
        status: {
          type: Sequelize.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending',
          comment: 'Estado de la solicitud'
        },
        rejection_reason: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Razón de rechazo'
        },
        // Gimnasio creado (si fue aprobado) - sin FK por ahora
        id_gym: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'ID del gimnasio creado tras aprobación'
        },
        // Admin que procesó - sin FK por ahora
        processed_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'ID del admin que procesó la solicitud'
        },
        processed_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Fecha de procesamiento'
        },
        // Timestamps
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // Ahora agregar foreign keys con ALTER TABLE (solo si no existen)
      console.log('🔗 Agregando foreign keys...');

      // Verificar si ya existe el constraint de gym
      const [gymConstraints] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
         WHERE TABLE_NAME = 'gym_request' AND CONSTRAINT_NAME = 'fk_gym_request_gym'`,
        { transaction }
      );

      if (gymConstraints.length === 0) {
        await queryInterface.sequelize.query(
          `ALTER TABLE gym_request
           ADD CONSTRAINT fk_gym_request_gym
           FOREIGN KEY (id_gym) REFERENCES gym(id_gym)
           ON DELETE SET NULL ON UPDATE CASCADE`,
          { transaction }
        );
      }

      // Verificar si existe la tabla account antes de crear el FK
      const [accountTable] = await queryInterface.sequelize.query(
        `SELECT TABLE_NAME FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'account'`,
        { transaction }
      );

      if (accountTable.length > 0) {
        // Solo agregar FK si la tabla account existe
        const [accountConstraints] = await queryInterface.sequelize.query(
          `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
           WHERE TABLE_NAME = 'gym_request' AND CONSTRAINT_NAME = 'fk_gym_request_account'`,
          { transaction }
        );

        if (accountConstraints.length === 0) {
          await queryInterface.sequelize.query(
            `ALTER TABLE gym_request
             ADD CONSTRAINT fk_gym_request_account
             FOREIGN KEY (processed_by) REFERENCES account(id_account)
             ON DELETE SET NULL ON UPDATE CASCADE`,
            { transaction }
          );
        }
      } else {
        console.log('⚠️  Tabla account no existe, omitiendo FK constraint para processed_by');
      }

      // Crear índices
      console.log('📊 Creando índices...');

      await queryInterface.addIndex('gym_request', ['status'], {
        name: 'idx_gym_request_status',
        transaction
      });

      await queryInterface.addIndex('gym_request', ['city'], {
        name: 'idx_gym_request_city',
        transaction
      });

      await queryInterface.addIndex('gym_request', ['created_at'], {
        name: 'idx_gym_request_created',
        transaction
      });

      await transaction.commit();
      console.log('✅ Tabla gym_request creada exitosamente\n');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al crear tabla gym_request:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 Eliminando tabla gym_request...');
      await queryInterface.dropTable('gym_request', { transaction });
      await transaction.commit();
      console.log('✅ Tabla gym_request eliminada\n');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al eliminar tabla gym_request:', error);
      throw error;
    }
  }
};
