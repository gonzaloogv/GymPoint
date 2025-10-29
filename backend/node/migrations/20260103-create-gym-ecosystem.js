'use strict';

/**
 * MIGRACIÓN 3: Gym Ecosystem Tables (REFACTORIZADA)
 *
 * Esta migración crea todo el ecosistema de gimnasios:
 * - gym: Información principal de gimnasios (con geofencing integrado)
 *   · services: Array de strings ["Funcional", "CrossFit", "Musculación"]
 *   · equipment: Objeto categorizado { "fuerza": [{ name, quantity }], "cardio": [...] }
 * - gym_schedule: Horarios regulares
 * - gym_special_schedule: Horarios especiales/excepciones
 * - gym_amenity: Catálogo de amenidades
 * - gym_gym_amenity: Relación many-to-many gyms-amenities
 * - gym_review: Reseñas de usuarios
 * - gym_rating_stats: Estadísticas consolidadas de ratings
 * - user_favorite_gym: Gimnasios favoritos de usuarios
 * - gym_payment: Histórico de pagos de usuarios en gyms
 *
 * ELIMINADO: gym_type y gym_gym_type (innecesarias, reemplazadas por services array)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 [3/7] Creando tablas del ecosistema de gimnasios...\n');

      // ========================================
      // TABLA: gym_type - ELIMINADA
      // ========================================
      // Ya no se necesita tabla gym_type separada
      // Los tipos/servicios ahora se almacenan como array de strings en gym.services

      // ========================================
      // TABLA: gym (Principal)
      // ========================================
      console.log(' Creando tabla "gym"...');
      await queryInterface.createTable('gym', {
        id_gym: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        city: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        address: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        latitude: {
          type: Sequelize.DECIMAL(10, 8),
          allowNull: false
        },
        longitude: {
          type: Sequelize.DECIMAL(11, 8),
          allowNull: false
        },
        phone: {
          type: Sequelize.STRING(20),
          allowNull: true
        },
        whatsapp: {
          type: Sequelize.STRING(20),
          allowNull: true
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        website: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        social_media: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Redes sociales: {facebook, instagram, twitter, etc.}'
        },
        equipment: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: '{}',
          comment: 'Equipamiento por categoría: { "fuerza": [{ "name": "Banco press", "quantity": 4 }], "cardio": [...] }'
        },
        services: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: '[]',
          comment: 'Array de servicios/tipos: ["Funcional", "CrossFit", "Musculación"]'
        },
        month_price: {
          type: Sequelize.DOUBLE,
          allowNull: true
        },
        week_price: {
          type: Sequelize.DOUBLE,
          allowNull: true
        },
        max_capacity: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Capacidad máxima de personas'
        },
        area_sqm: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
          comment: 'Área en metros cuadrados'
        },
        verified: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si el gimnasio está verificado por el sistema'
        },
        featured: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si es destacado en la app'
        },
        photo_url: {
          type: Sequelize.STRING(500),
          allowNull: true,
          comment: 'URL de foto principal'
        },
        logo_url: {
          type: Sequelize.STRING(500),
          allowNull: true,
          comment: 'URL del logo'
        },
        rules: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: '[]',
          comment: 'Reglas del gimnasio (array de strings)'
        },
        instagram: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Usuario de Instagram (sin @)'
        },
        facebook: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Usuario o página de Facebook'
        },
        google_maps_url: {
          type: Sequelize.STRING(500),
          allowNull: true,
          comment: 'URL completa de Google Maps para navegación'
        },
        geofence_radius_meters: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 150,
          comment: 'Radio de geofence para auto check-in en metros'
        },
        auto_checkin_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Si el auto check-in está habilitado'
        },
        min_stay_minutes: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 10,
          comment: 'Tiempo mínimo de estadía para confirmar check-in'
        },
        registration_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Soft delete'
        }
      }, { transaction });

      await queryInterface.addIndex('gym', ['city'], {
        name: 'idx_gym_city',
        transaction
      });
      await queryInterface.addIndex('gym', ['verified', 'featured'], {
        name: 'idx_gym_verified_featured',
        transaction
      });
      await queryInterface.addIndex('gym', ['latitude', 'longitude'], {
        name: 'idx_gym_location',
        transaction
      });
      await queryInterface.addIndex('gym', ['deleted_at'], {
        name: 'idx_gym_deleted',
        transaction
      });
      await queryInterface.addIndex('gym', ['instagram'], {
        name: 'idx_gym_instagram',
        transaction
      });
      console.log(' Tabla "gym" creada con 5 índices\n');

      // ========================================
      // TABLA: gym_schedule
      // ========================================
      console.log(' Creando tabla "gym_schedule"...');
      await queryInterface.createTable('gym_schedule', {
        id_schedule: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_gym: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        day_of_week: {
          type: Sequelize.TINYINT,
          allowNull: false,
          comment: '0=Domingo, 1=Lunes, ..., 6=Sábado'
        },
        open_time: {
          type: Sequelize.TIME,
          allowNull: false
        },
        close_time: {
          type: Sequelize.TIME,
          allowNull: false
        },
        is_closed: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si está cerrado ese día'
        }
      }, { transaction });

      await queryInterface.addIndex('gym_schedule', ['id_gym', 'day_of_week'], {
        name: 'idx_gym_schedule_gym_day',
        transaction
      });
      console.log(' Tabla "gym_schedule" creada con 1 índice\n');

      // ========================================
      // TABLA: gym_special_schedule
      // ========================================
      console.log(' Creando tabla "gym_special_schedule"...');
      await queryInterface.createTable('gym_special_schedule', {
        id_special_schedule: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_gym: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          comment: 'Fecha específica (feriados, eventos especiales)'
        },
        open_time: {
          type: Sequelize.TIME,
          allowNull: true
        },
        close_time: {
          type: Sequelize.TIME,
          allowNull: true
        },
        is_closed: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        reason: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Razón del horario especial'
        }
      }, { transaction });

      await queryInterface.addIndex('gym_special_schedule', ['id_gym', 'date'], {
        unique: true,
        name: 'idx_gym_special_schedule_gym_date',
        transaction
      });
      console.log(' Tabla "gym_special_schedule" creada con 1 índice\n');

      // ========================================
      // TABLA: gym_amenity
      // ========================================
      console.log(' Creando tabla "gym_amenity"...');
      await queryInterface.createTable('gym_amenity', {
        id_amenity: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
          comment: 'Nombre de la amenidad (Ducha, Locker, WiFi, etc.)'
        },
        category: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Categoría (FACILITY, SERVICE, EQUIPMENT)'
        },
        icon_name: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Nombre del ícono para la UI'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });
      console.log(' Tabla "gym_amenity" creada\n');

      // ========================================
      // TABLA: gym_gym_amenity (Many-to-Many)
      // ========================================
      console.log(' Creando tabla "gym_gym_amenity"...');
      await queryInterface.createTable('gym_gym_amenity', {
        id_gym: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        id_amenity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'gym_amenity',
            key: 'id_amenity'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Notas adicionales sobre esta amenidad en este gym'
        }
      }, { transaction });

      await queryInterface.addConstraint('gym_gym_amenity', {
        fields: ['id_gym', 'id_amenity'],
        type: 'primary key',
        name: 'pk_gym_amenity'
      }, { transaction });

      await queryInterface.addIndex('gym_gym_amenity', ['id_amenity'], {
        name: 'idx_gym_amenity_amenity',
        transaction
      });
      console.log(' Tabla "gym_gym_amenity" creada con PK compuesta e índice\n');

      // ========================================
      // TABLA: gym_gym_type - ELIMINADA
      // ========================================
      // Ya no se necesita tabla gym_gym_type (relación many-to-many)
      // Los servicios/tipos ahora están en gym.services como array de strings

      // ========================================
      // TABLA: gym_review
      // ========================================
      console.log(' Creando tabla "gym_review"...');
      await queryInterface.createTable('gym_review', {
        id_review: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_gym: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        id_user_profile: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user_profiles',
            key: 'id_user_profile'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        rating: {
          type: Sequelize.DECIMAL(2, 1),
          allowNull: false,
          comment: 'Rating general (1.0 - 5.0)'
        },
        title: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        comment: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        cleanliness_rating: {
          type: Sequelize.TINYINT,
          allowNull: true,
          comment: 'Rating de limpieza (1-5)'
        },
        equipment_rating: {
          type: Sequelize.TINYINT,
          allowNull: true,
          comment: 'Rating de equipamiento (1-5)'
        },
        staff_rating: {
          type: Sequelize.TINYINT,
          allowNull: true,
          comment: 'Rating de personal (1-5)'
        },
        value_rating: {
          type: Sequelize.TINYINT,
          allowNull: true,
          comment: 'Rating de relación calidad-precio (1-5)'
        },
        is_verified: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Si la review está verificada (usuario asistió al gym)'
        },
        helpful_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Cantidad de usuarios que marcaron como útil'
        },
        reported: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addConstraint('gym_review', {
        fields: ['id_user_profile', 'id_gym'],
        type: 'unique',
        name: 'uniq_user_gym_review'
      }, { transaction });

      await queryInterface.addIndex('gym_review', ['id_gym', 'rating'], {
        name: 'idx_gym_rating',
        transaction
      });
      await queryInterface.addIndex('gym_review', ['created_at'], {
        name: 'idx_review_created_at',
        transaction
      });
      console.log(' Tabla "gym_review" creada con constraint único y 2 índices\n');

      // ========================================
      // TABLA: gym_rating_stats
      // ========================================
      console.log(' Creando tabla "gym_rating_stats"...');
      await queryInterface.createTable('gym_rating_stats', {
        id_gym: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        avg_rating: {
          type: Sequelize.DECIMAL(3, 2),
          allowNull: false,
          defaultValue: 0
        },
        total_reviews: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        rating_5_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        rating_4_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        rating_3_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        rating_2_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        rating_1_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        avg_cleanliness: {
          type: Sequelize.DECIMAL(3, 2),
          allowNull: false,
          defaultValue: 0
        },
        avg_equipment: {
          type: Sequelize.DECIMAL(3, 2),
          allowNull: false,
          defaultValue: 0
        },
        avg_staff: {
          type: Sequelize.DECIMAL(3, 2),
          allowNull: false,
          defaultValue: 0
        },
        avg_value: {
          type: Sequelize.DECIMAL(3, 2),
          allowNull: false,
          defaultValue: 0
        },
        last_review_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('gym_rating_stats', ['avg_rating'], {
        name: 'idx_gym_stats_rating',
        transaction
      });
      console.log(' Tabla "gym_rating_stats" creada con 1 índice\n');

      // ========================================
      // TABLA: review_helpful
      // ========================================
      console.log(' Creando tabla "review_helpful"...');
      await queryInterface.createTable('review_helpful', {
        id_review: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'gym_review',
            key: 'id_review'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        id_user_profile: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user_profiles',
            key: 'id_user_profile'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addConstraint('review_helpful', {
        fields: ['id_review', 'id_user_profile'],
        type: 'primary key',
        name: 'pk_review_helpful'
      }, { transaction });
      console.log(' Tabla "review_helpful" creada con PK compuesta\n');

      // ========================================
      // TABLA: user_favorite_gym
      // ========================================
      console.log(' Creando tabla "user_favorite_gym"...');
      await queryInterface.createTable('user_favorite_gym', {
        id_user_profile: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user_profiles',
            key: 'id_user_profile'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        id_gym: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addConstraint('user_favorite_gym', {
        fields: ['id_user_profile', 'id_gym'],
        type: 'primary key',
        name: 'pk_user_favorite_gym'
      }, { transaction });

      await queryInterface.addIndex('user_favorite_gym', ['id_gym'], {
        name: 'idx_favorite_gym',
        transaction
      });
      console.log(' Tabla "user_favorite_gym" creada con PK compuesta e índice\n');

      // ========================================
      // TABLA: gym_payment
      // ========================================
      console.log(' Creando tabla "gym_payment"...');
      await queryInterface.createTable('gym_payment', {
        id_payment: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        id_user_profile: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user_profiles',
            key: 'id_user_profile'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        id_gym: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'gym',
            key: 'id_gym'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        payment_method: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        payment_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        period_start: {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: 'Inicio del período pagado'
        },
        period_end: {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: 'Fin del período pagado'
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'),
          allowNull: false,
          defaultValue: 'PENDING'
        }
      }, { transaction });

      await queryInterface.addIndex('gym_payment', ['id_user_profile', 'id_gym'], {
        name: 'idx_gym_payment_user_gym',
        transaction
      });
      await queryInterface.addIndex('gym_payment', ['payment_date', 'status'], {
        name: 'idx_gym_payment_date_status',
        transaction
      });
      console.log(' Tabla "gym_payment" creada con 2 índices\n');

      await transaction.commit();
      console.log('========================================');
      console.log(' MIGRACIÓN 3 COMPLETADA');
      console.log('========================================');
      console.log(' Tablas creadas: 10');
      console.log('   - gym (con geofencing + redes sociales + services array + equipment categorizado)');
      console.log('   - gym_schedule, gym_special_schedule');
      console.log('   - gym_amenity, gym_gym_amenity');
      console.log('   - gym_review, gym_rating_stats, review_helpful');
      console.log('   - user_favorite_gym, gym_payment');
      console.log(' Tablas ELIMINADAS: gym_type, gym_gym_type (reemplazadas por services array)');
      console.log(' Índices creados: 13');
      console.log(' Foreign Keys: Todas las relaciones configuradas');
      console.log(' Campos JSON: services (array), equipment (categorizado)');
      console.log('========================================\n');

    } catch (error) {
      await transaction.rollback();
      console.error(' Error en migración 3:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log(' Revirtiendo migración 3...\n');

      // Eliminar en orden inverso por las FK
      await queryInterface.dropTable('gym_payment', { transaction });
      await queryInterface.dropTable('user_favorite_gym', { transaction });
      await queryInterface.dropTable('review_helpful', { transaction });
      await queryInterface.dropTable('gym_rating_stats', { transaction });
      await queryInterface.dropTable('gym_review', { transaction });
      // gym_gym_type y gym_type eliminadas - ya no existen
      await queryInterface.dropTable('gym_gym_amenity', { transaction });
      await queryInterface.dropTable('gym_amenity', { transaction });
      await queryInterface.dropTable('gym_special_schedule', { transaction });
      await queryInterface.dropTable('gym_schedule', { transaction });
      await queryInterface.dropTable('gym', { transaction });

      await transaction.commit();
      console.log(' Migración 3 revertida\n');

    } catch (error) {
      await transaction.rollback();
      console.error(' Error al revertir migración 3:', error);
      throw error;
    }
  }
};
