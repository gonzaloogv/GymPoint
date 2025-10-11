'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;
    // Eliminar tabla media antigua (si existía con otra estructura)
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `media`;');

    // Tabla media
    await queryInterface.createTable('media', {
      id_media: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      entity_type: {
        type: DataTypes.ENUM('USER_PROFILE', 'GYM', 'EXERCISE', 'PROGRESS'),
        allowNull: false
      },
      entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      media_type: {
        type: DataTypes.ENUM('IMAGE', 'VIDEO'),
        allowNull: false,
        defaultValue: 'IMAGE'
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      thumbnail_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Tamaño del archivo en bytes'
      },
      mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      width: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      height: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      uploaded_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
    await queryInterface.addIndex('media', ['entity_type', 'entity_id'], {
      name: 'idx_media_entity'
    });
    await queryInterface.addIndex('media', ['entity_type', 'entity_id', 'is_primary'], {
      name: 'idx_media_primary'
    });
    // Tabla gym_review
    await queryInterface.createTable('gym_review', {
      id_review: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_gym: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'gym',
          key: 'id_gym'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_user_profile: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user_profiles',
          key: 'id_user_profile'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      cleanliness_rating: {
        type: DataTypes.TINYINT,
        allowNull: true
      },
      equipment_rating: {
        type: DataTypes.TINYINT,
        allowNull: true
      },
      staff_rating: {
        type: DataTypes.TINYINT,
        allowNull: true
      },
      value_rating: {
        type: DataTypes.TINYINT,
        allowNull: true
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      helpful_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      reported: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
    await queryInterface.addConstraint('gym_review', {
      type: 'unique',
      fields: ['id_user_profile', 'id_gym'],
      name: 'uniq_user_gym_review'
    });
    await queryInterface.addIndex('gym_review', ['id_gym', 'rating'], {
      name: 'idx_gym_rating'
    });
    await queryInterface.addIndex('gym_review', ['created_at'], {
      name: 'idx_review_created_at'
    });
    // Tabla gym_rating_stats
    await queryInterface.createTable('gym_rating_stats', {
      id_gym: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'gym',
          key: 'id_gym'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      avg_rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_reviews: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      rating_5_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      rating_4_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      rating_3_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      rating_2_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      rating_1_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      avg_cleanliness: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0
      },
      avg_equipment: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0
      },
      avg_staff: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0
      },
      avg_value: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0
      },
      last_review_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
    await queryInterface.addIndex('gym_rating_stats', ['avg_rating'], {
      name: 'idx_gym_stats_rating'
    });
    // Tabla review_helpful
    await queryInterface.createTable('review_helpful', {
      id_review: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'gym_review',
          key: 'id_review'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_user_profile: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user_profiles',
          key: 'id_user_profile'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
    await queryInterface.addConstraint('review_helpful', {
      type: 'primary key',
      fields: ['id_review', 'id_user_profile'],
      name: 'pk_review_helpful'
    });
    // Tabla user_favorite_gym
    await queryInterface.createTable('user_favorite_gym', {
      id_user_profile: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user_profiles',
          key: 'id_user_profile'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_gym: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'gym',
          key: 'id_gym'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
    await queryInterface.addConstraint('user_favorite_gym', {
      type: 'primary key',
      fields: ['id_user_profile', 'id_gym'],
      name: 'pk_user_favorite_gym'
    });
    await queryInterface.addIndex('user_favorite_gym', ['id_gym'], {
      name: 'idx_favorite_gym'
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('user_favorite_gym', 'idx_favorite_gym');
    await queryInterface.removeConstraint('user_favorite_gym', 'pk_user_favorite_gym');
    await queryInterface.dropTable('user_favorite_gym');
    await queryInterface.removeConstraint('review_helpful', 'pk_review_helpful');
    await queryInterface.dropTable('review_helpful');
    await queryInterface.removeIndex('gym_rating_stats', 'idx_gym_stats_rating');
    await queryInterface.dropTable('gym_rating_stats');
    await queryInterface.removeIndex('gym_review', 'idx_review_created_at');
    await queryInterface.removeIndex('gym_review', 'idx_gym_rating');
    await queryInterface.removeConstraint('gym_review', 'uniq_user_gym_review');
    await queryInterface.dropTable('gym_review');
    await queryInterface.removeIndex('media', 'idx_media_primary');
    await queryInterface.removeIndex('media', 'idx_media_entity');
    await queryInterface.dropTable('media');
    // MySQL elimina ENUMs autom��ticamente al borrar la tabla
  }
};
