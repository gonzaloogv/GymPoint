const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reward = sequelize.define('Reward', {
  id_reward: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'gym',
      key: 'id_gym'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Gimnasio que ofrece la recompensa (NULL = recompensa global)'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reward_type: {
    type: DataTypes.ENUM('descuento', 'pase_gratis', 'producto', 'servicio', 'merchandising', 'otro'),
    allowNull: true,
    comment: 'Tipo de recompensa'
  },
  effect_value: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Valor del efecto según reward_type (ej: días de premium, % descuento)'
  },
  token_cost: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Costo en tokens'
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Porcentaje de descuento (si aplica)'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Monto fijo de descuento (si aplica)'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Stock disponible (NULL = ilimitado)'
  },
  valid_from: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fecha desde que es válida'
  },
  valid_until: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fecha hasta que es válida'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si la recompensa está activa'
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de la imagen de la recompensa'
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Términos y condiciones de la recompensa'
  }
}, {
  tableName: 'reward',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    {
      fields: ['id_gym', 'is_active'],
      name: 'idx_reward_gym_active'
    },
    {
      fields: ['token_cost'],
      name: 'idx_reward_cost'
    },
    {
      fields: ['deleted_at'],
      name: 'idx_reward_deleted'
    }
  ],
  hooks: {
    beforeSave: (reward) => {
      // Normalizar reward_type a minúsculas
      if (reward.reward_type) {
        reward.reward_type = reward.reward_type.toLowerCase();
      }
    }
  }
});

module.exports = Reward;

// Las asociaciones se definen en index.js para evitar referencias circulares

