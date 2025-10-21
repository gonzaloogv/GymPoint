'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('gym_amenity', {
      id_amenity: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      category: {
        type: DataTypes.ENUM('FACILITY', 'SERVICE', 'SAFETY', 'EXTRA'),
        allowNull: false,
        defaultValue: 'FACILITY'
      },
      icon: {
        type: DataTypes.STRING(50),
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

    await queryInterface.createTable('gym_gym_amenity', {
      id_gym_amenity: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
      id_amenity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'gym_amenity',
          key: 'id_amenity'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addConstraint('gym_gym_amenity', {
      type: 'unique',
      fields: ['id_gym', 'id_amenity'],
      name: 'unique_gym_amenity'
    });

    await queryInterface.bulkInsert('gym_amenity', [
      { name: 'Estacionamiento', category: 'FACILITY', icon: 'car', created_at: new Date(), updated_at: new Date() },
      { name: 'Vestuarios', category: 'FACILITY', icon: 'shirt', created_at: new Date(), updated_at: new Date() },
      { name: 'Duchas', category: 'FACILITY', icon: 'water', created_at: new Date(), updated_at: new Date() },
      { name: 'WiFi Gratuito', category: 'FACILITY', icon: 'wifi', created_at: new Date(), updated_at: new Date() },
      { name: 'Clases Grupales', category: 'SERVICE', icon: 'people', created_at: new Date(), updated_at: new Date() },
      { name: 'Entrenador Personal', category: 'SERVICE', icon: 'person', created_at: new Date(), updated_at: new Date() },
      { name: 'Área de Crossfit', category: 'EXTRA', icon: 'fitness', created_at: new Date(), updated_at: new Date() },
      { name: 'Circuito Funcional', category: 'EXTRA', icon: 'repeat', created_at: new Date(), updated_at: new Date() },
      { name: 'Lockers', category: 'SAFETY', icon: 'lock-closed', created_at: new Date(), updated_at: new Date() },
      { name: 'Seguridad las 24hs', category: 'SAFETY', icon: 'shield-checkmark', created_at: new Date(), updated_at: new Date() }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('gym_gym_amenity', null, {});
    await queryInterface.bulkDelete('gym_amenity', null, {});
    await queryInterface.dropTable('gym_gym_amenity');
    await queryInterface.dropTable('gym_amenity');
  }
};

