/**
 * UserGym Controller - Lote 9 CQRS
 * HTTP layer for gym subscriptions using Commands/Queries/Mappers
 */

const userGymService = require('../services/user-gym-service');
const { userGymMappers } = require('../services/mappers');

// ============================================================================
// SUBSCRIBE (Alta)
// ============================================================================

const darAltaEnGimnasio = async (req, res) => {
  try {
    const id_user = req.user?.id_user_profile;
    const { id_gym, plan, subscription_start, subscription_end } = req.body;

    if (!id_gym || !plan) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Faltan datos requeridos (id_gym, plan)',
        },
      });
    }

    const PLANES_VALIDOS = ['MENSUAL', 'SEMANAL', 'ANUAL'];
    const planNormalizado = plan.toUpperCase().trim();

    if (!PLANES_VALIDOS.includes(planNormalizado)) {
      return res.status(422).json({
        error: {
          code: 'INVALID_PLAN',
          message: `Plan inválido. Valores aceptados: ${PLANES_VALIDOS.join(', ')}`,
          accepted_values: PLANES_VALIDOS,
        },
      });
    }

    const alta = await userGymService.darAltaEnGimnasio({
      id_user,
      id_gym,
      plan: planNormalizado,
      subscription_start, // Opcional: fecha manual
      subscription_end,   // Opcional: fecha manual
    });

    const dto = userGymMappers.toUserGymDTO(alta);

    res.status(201).json({
      message: 'Alta en gimnasio realizada con éxito',
      data: dto,
    });
  } catch (err) {
    console.error('Error en darAltaEnGimnasio:', err.message);
    res.status(400).json({
      error: {
        code: 'ALTA_FAILED',
        message: err.message,
      },
    });
  }
};

// ============================================================================
// UNSUBSCRIBE (Baja)
// ============================================================================

const darBajaEnGimnasio = async (req, res) => {
  try {
    const id_user = req.user?.id_user_profile;
    const { id_gym } = req.body;

    if (!id_gym) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Falta el ID del gimnasio',
        },
      });
    }

    await userGymService.darBajaEnGimnasio({ id_user, id_gym });

    res.json({
      message: 'Baja en gimnasio realizada con éxito',
    });
  } catch (err) {
    console.error('Error en darBajaEnGimnasio:', err.message);
    res.status(400).json({
      error: {
        code: 'BAJA_FAILED',
        message: err.message,
      },
    });
  }
};

// ============================================================================
// LIST ACTIVE GYMS
// ============================================================================

const obtenerGimnasiosActivos = async (req, res) => {
  try {
    const id_user = req.user?.id_user_profile;

    const result = await userGymService.obtenerGimnasiosActivos(id_user);
    const dto = userGymMappers.toUserGymsDTO(result);

    res.json({
      message: 'Gimnasios activos obtenidos con éxito',
      data: dto,
    });
  } catch (err) {
    console.error('Error en obtenerGimnasiosActivos:', err.message);
    res.status(400).json({
      error: {
        code: 'GET_ACTIVOS_FAILED',
        message: err.message,
      },
    });
  }
};

// ============================================================================
// HISTORY BY USER
// ============================================================================

const obtenerHistorialGimnasiosPorUsuario = async (req, res) => {
  try {
    const id_user = req.user?.id_user_profile;
    const { active } = req.query;

    const historial = await userGymService.obtenerHistorialGimnasiosPorUsuario(id_user, active);
    const dto = userGymMappers.toUserGymsDTO(historial);

    res.json({
      message: 'Historial de gimnasios obtenido con éxito',
      data: dto,
    });
  } catch (err) {
    console.error('Error en obtenerHistorialGimnasiosPorUsuario:', err.message);
    res.status(400).json({
      error: {
        code: 'GET_HISTORIAL_FAILED',
        message: err.message,
      },
    });
  }
};

// ============================================================================
// HISTORY BY GYM
// ============================================================================

const obtenerHistorialUsuariosPorGimnasio = async (req, res) => {
  try {
    const { id_gym } = req.params;
    const { active } = req.query;

    const historial = await userGymService.obtenerHistorialUsuariosPorGimnasio(id_gym, active);
    const dto = userGymMappers.toUserGymsDTO(historial);

    res.json(dto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ============================================================================
// COUNT ACTIVE MEMBERS
// ============================================================================

const contarUsuariosActivosEnGimnasio = async (req, res) => {
  try {
    const total = await userGymService.contarUsuariosActivosEnGimnasio(req.params.id_gym);
    const dto = userGymMappers.toMemberCountDTO(total);

    res.json({ id_gym: req.params.id_gym, ...dto });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  darAltaEnGimnasio,
  darBajaEnGimnasio,
  obtenerGimnasiosActivos,
  obtenerHistorialGimnasiosPorUsuario,
  obtenerHistorialUsuariosPorGimnasio,
  contarUsuariosActivosEnGimnasio,
};
