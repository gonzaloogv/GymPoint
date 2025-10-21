'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('mercadopago_payment', {
      id_mp_payment: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      id_user_profile: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user_profiles',
          key: 'id_user_profile'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_gym: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'gym',
          key: 'id_gym'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subscription_type: {
        type: DataTypes.ENUM('MONTHLY', 'WEEKLY', 'DAILY', 'ANNUAL'),
        allowNull: false,
        defaultValue: 'MONTHLY'
      },
      auto_renew: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'ARS'
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      preference_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      payment_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      merchant_order_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      external_reference: {
        type: DataTypes.STRING(150),
        allowNull: true,
        unique: true
      },
      status: {
        type: DataTypes.ENUM(
          'PENDING',
          'APPROVED',
          'AUTHORIZED',
          'IN_PROCESS',
          'IN_MEDIATION',
          'REJECTED',
          'CANCELLED',
          'REFUNDED',
          'CHARGED_BACK'
        ),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      status_detail: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      payment_type: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      webhook_received_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      payer_email: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      raw_response: {
        type: DataTypes.JSON,
        allowNull: true
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

    await queryInterface.addIndex('mercadopago_payment', ['payment_id'], {
      name: 'idx_mp_payment_id'
    });

    await queryInterface.addIndex('mercadopago_payment', ['preference_id'], {
      name: 'idx_mp_preference_id'
    });

    await queryInterface.addIndex('mercadopago_payment', ['status'], {
      name: 'idx_mp_status'
    });

    await queryInterface.addIndex('mercadopago_payment', ['id_user_profile', 'id_gym'], {
      name: 'idx_mp_user_gym'
    });

    // Update user_gym table with payment linkage and subscription metadata
    await queryInterface.addColumn('user_gym', 'id_payment', {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'mercadopago_payment',
        key: 'id_mp_payment'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('user_gym', 'subscription_type', {
      type: DataTypes.ENUM('MONTHLY', 'WEEKLY', 'DAILY', 'ANNUAL'),
      allowNull: false,
      defaultValue: 'MONTHLY'
    });

    await queryInterface.addColumn('user_gym', 'auto_renew', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('user_gym', 'auto_renew');

    await queryInterface.removeColumn('user_gym', 'subscription_type');

    await queryInterface.removeColumn('user_gym', 'id_payment');

    await queryInterface.dropTable('mercadopago_payment');

  }
};
