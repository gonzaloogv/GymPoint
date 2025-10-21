'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Vista: Dashboard completo del usuario, alineada al esquema actual
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW vw_user_dashboard AS
      SELECT 
        up.id_user_profile,
        up.name,
        up.lastname,
        CONCAT(up.name, ' ', up.lastname) AS full_name,
        up.tokens,
        up.subscription,
        a.email,
        (
          SELECT ubm.weight_kg FROM user_body_metrics ubm
          WHERE ubm.id_user_profile = up.id_user_profile
          ORDER BY ubm.measured_at DESC
          LIMIT 1
        ) AS current_weight_kg,
        (
          SELECT ubm.height_cm FROM user_body_metrics ubm
          WHERE ubm.id_user_profile = up.id_user_profile
          ORDER BY ubm.measured_at DESC
          LIMIT 1
        ) AS current_height_cm,
        (
          SELECT ubm.bmi FROM user_body_metrics ubm
          WHERE ubm.id_user_profile = up.id_user_profile
          ORDER BY ubm.measured_at DESC
          LIMIT 1
        ) AS current_bmi,
        (
          SELECT f.goal FROM frequency f
          WHERE f.id_user = up.id_user_profile
          ORDER BY f.week_start_date DESC, f.created_at DESC
          LIMIT 1
        ) AS weekly_goal,
        (
          SELECT f.assist FROM frequency f
          WHERE f.id_user = up.id_user_profile
          ORDER BY f.week_start_date DESC, f.created_at DESC
          LIMIT 1
        ) AS weekly_assists,
        (
          SELECT s.value FROM streak s
          WHERE s.id_user = up.id_user_profile
          ORDER BY s.updated_at DESC
          LIMIT 1
        ) AS current_streak,
        (
          SELECT COUNT(*) FROM user_gym ug
          WHERE ug.id_user = up.id_user_profile AND ug.active = TRUE
        ) AS active_gyms,
        (
          SELECT COUNT(*) FROM assistance asst
          WHERE asst.id_user = up.id_user_profile
        ) AS total_attendances,
        (
          SELECT COUNT(*) FROM workout_session ws
          WHERE ws.id_user_profile = up.id_user_profile AND ws.status = 'COMPLETED'
        ) AS completed_workouts,
        up.created_at AS member_since
      FROM user_profiles up
      JOIN accounts a ON up.id_account = a.id_account
      WHERE a.is_active = TRUE;
    `);

    // Vista: Gimnasios con stats y datos agregados
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW vw_gym_complete AS
      SELECT 
        g.id_gym,
        g.name,
        g.description,
        g.city,
        g.address,
        g.latitude,
        g.longitude,
        g.phone,
        g.whatsapp,
        g.email,
        g.website,
        g.instagram,
        g.facebook,
        g.google_maps_url,
        g.max_capacity,
        g.area_sqm,
        g.verified,
        g.featured,
        g.month_price,
        g.week_price,
        g.photo_url,
        g.created_at,
        g.updated_at,
        COALESCE(grs.avg_rating, 0) AS rating,
        COALESCE(grs.total_reviews, 0) AS reviews_count,
        (
          SELECT COUNT(DISTINCT ug.id_user) 
          FROM user_gym ug 
          WHERE ug.id_gym = g.id_gym AND ug.active = TRUE
        ) AS active_members,
        (
          SELECT COUNT(*) 
          FROM assistance a 
          WHERE a.id_gym = g.id_gym 
            AND a.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ) AS monthly_visits,
        (
          SELECT COUNT(*) 
          FROM user_favorite_gym ufg 
          WHERE ufg.id_gym = g.id_gym
        ) AS favorites_count,
        (
          SELECT m.url 
          FROM media m 
          WHERE m.entity_type = 'GYM' AND m.entity_id = g.id_gym AND m.is_primary = TRUE 
          ORDER BY m.uploaded_at DESC
          LIMIT 1
        ) AS main_image
      FROM gym g
      LEFT JOIN gym_rating_stats grs ON g.id_gym = grs.id_gym
      WHERE g.deleted_at IS NULL;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS vw_user_dashboard;');
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS vw_gym_complete;');
  }
};

