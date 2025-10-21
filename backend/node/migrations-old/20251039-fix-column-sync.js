'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;
    const currentTimestamp = Sequelize.literal('CURRENT_TIMESTAMP');

    const isDateTime = (column) => {
      if (!column) return false;
      const type = String(column.type || '').toLowerCase();
      return type.includes('datetime') || type.includes('timestamp');
    };

    // ---- Workout sessions ----
    const workoutTable = await queryInterface.describeTable('workout_session');

    if (workoutTable.start_time) {
      await queryInterface.renameColumn('workout_session', 'start_time', 'started_at');
    }

    if (workoutTable.end_time) {
      await queryInterface.renameColumn('workout_session', 'end_time', 'ended_at');
    }

    const workoutTableUpdated = await queryInterface.describeTable('workout_session');

    if (workoutTableUpdated.started_at && !isDateTime(workoutTableUpdated.started_at)) {
      await queryInterface.changeColumn('workout_session', 'started_at', {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      });
    }

    if (workoutTableUpdated.ended_at && !isDateTime(workoutTableUpdated.ended_at)) {
      await queryInterface.changeColumn('workout_session', 'ended_at', {
        type: DataTypes.DATE,
        allowNull: true
      });
    }

    // ---- Body metrics ----
    const bodyTable = await queryInterface.describeTable('user_body_metrics');

    const legacyIdColumns = ['id_body_metrics', 'id_metric'];
    for (const legacyColumn of legacyIdColumns) {
      if (Object.prototype.hasOwnProperty.call(bodyTable, legacyColumn)) {
        await queryInterface.renameColumn('user_body_metrics', legacyColumn, 'id_body_metric');
        break;
      }
    }

    let refreshedBodyTable = await queryInterface.describeTable('user_body_metrics');

    const hasRecordedDate = Object.prototype.hasOwnProperty.call(refreshedBodyTable, 'recorded_date');
    const hasRecordedTime = Object.prototype.hasOwnProperty.call(refreshedBodyTable, 'recorded_time');
    const hasMeasuredAt = Object.prototype.hasOwnProperty.call(refreshedBodyTable, 'measured_at');

    if (!hasMeasuredAt) {
      await queryInterface.addColumn('user_body_metrics', 'measured_at', {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    if (hasRecordedDate || hasRecordedTime) {
      let measuredAtCase;

      if (hasRecordedDate && hasRecordedTime) {
        measuredAtCase = `
          CASE
            WHEN recorded_date IS NOT NULL AND recorded_time IS NOT NULL THEN TIMESTAMP(recorded_date, recorded_time)
            WHEN recorded_date IS NOT NULL THEN TIMESTAMP(recorded_date, '00:00:00')
            ELSE measured_at
          END
        `;
      } else if (hasRecordedDate) {
        measuredAtCase = `
          CASE
            WHEN recorded_date IS NOT NULL THEN TIMESTAMP(recorded_date, '00:00:00')
            ELSE measured_at
          END
        `;
      } else {
        measuredAtCase = `
          CASE
            WHEN recorded_time IS NOT NULL THEN TIMESTAMP(CURDATE(), recorded_time)
            ELSE measured_at
          END
        `;
      }

      await queryInterface.sequelize.query(`
        UPDATE user_body_metrics
        SET measured_at = ${measuredAtCase}
      `);

      if (hasRecordedTime) {
        await queryInterface.removeColumn('user_body_metrics', 'recorded_time');
      }

      if (hasRecordedDate) {
        await queryInterface.removeColumn('user_body_metrics', 'recorded_date');
      }
    }

    await queryInterface.sequelize.query(`
      UPDATE user_body_metrics
      SET measured_at = COALESCE(measured_at, created_at, updated_at, NOW())
      WHERE measured_at IS NULL
    `);

    refreshedBodyTable = await queryInterface.describeTable('user_body_metrics');

    if (refreshedBodyTable.measured_at && !isDateTime(refreshedBodyTable.measured_at)) {
      await queryInterface.changeColumn('user_body_metrics', 'measured_at', {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: currentTimestamp
      });
    } else if (Object.prototype.hasOwnProperty.call(refreshedBodyTable, 'measured_at')) {
      await queryInterface.changeColumn('user_body_metrics', 'measured_at', {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: currentTimestamp
      });
    }

    // ---- Notifications ----
    const notificationTable = await queryInterface.describeTable('notification');

    if (!notificationTable.read_at) {
      await queryInterface.addColumn('notification', 'read_at', {
        type: DataTypes.DATE,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    const workoutTable = await queryInterface.describeTable('workout_session');

    if (workoutTable.started_at) {
      await queryInterface.renameColumn('workout_session', 'started_at', 'start_time');
      await queryInterface.changeColumn('workout_session', 'start_time', {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '00:00:00'
      });
    }

    if (workoutTable.ended_at) {
      await queryInterface.renameColumn('workout_session', 'ended_at', 'end_time');
      await queryInterface.changeColumn('workout_session', 'end_time', {
        type: DataTypes.TIME,
        allowNull: true
      });
    }

    const bodyTable = await queryInterface.describeTable('user_body_metrics');

    if (!Object.prototype.hasOwnProperty.call(bodyTable, 'recorded_date')) {
      await queryInterface.addColumn('user_body_metrics', 'recorded_date', {
        type: DataTypes.DATE,
        allowNull: true
      });
    }

    if (!Object.prototype.hasOwnProperty.call(bodyTable, 'recorded_time')) {
      await queryInterface.addColumn('user_body_metrics', 'recorded_time', {
        type: DataTypes.TIME,
        allowNull: true
      });
    }

    if (Object.prototype.hasOwnProperty.call(bodyTable, 'measured_at')) {
      await queryInterface.sequelize.query(`
        UPDATE user_body_metrics
        SET
          recorded_date = COALESCE(DATE(measured_at), recorded_date),
          recorded_time = COALESCE(TIME(measured_at), recorded_time)
        WHERE measured_at IS NOT NULL
      `);

      await queryInterface.removeColumn('user_body_metrics', 'measured_at');
    }

    const refreshedBodyTable = await queryInterface.describeTable('user_body_metrics');

    if (refreshedBodyTable.id_body_metric) {
      await queryInterface.renameColumn('user_body_metrics', 'id_body_metric', 'id_body_metrics');
    }

    const notificationTable = await queryInterface.describeTable('notification');

    if (notificationTable.read_at) {
      await queryInterface.removeColumn('notification', 'read_at');
    }
  }
};
