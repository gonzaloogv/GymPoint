'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('user', {
      fields: ['email'],
      type: 'unique',
      name: 'unique_user_email',
    });
    await queryInterface.addConstraint('reward_code', {
      fields: ['code'],
      type: 'unique',
      name: 'unique_reward_code',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeConstraint('user', 'unique_user_email');
    await queryInterface.removeConstraint('reward_code', 'unique_reward_code');
  },
};
