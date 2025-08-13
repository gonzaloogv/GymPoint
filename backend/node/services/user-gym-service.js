const UserGym = require('../models/UserGym');
const Gym = require('../models/Gym');
const User = require('../models/User');

const darAltaEnGimnasio = async ({ id_user, id_gym, plan }) => {
  const hoy = new Date();

  const existente = await UserGym.findOne({
    where: { id_user, id_gym },
  });

  if (existente) {
    if (existente.active) {
      throw new Error('El usuario ya está activo en este gimnasio.');
    } else {
      // Reactivar vínculo dado de baja
      existente.start_date = hoy;
      existente.finish_date = null;
      existente.active = true;
      existente.plan = plan;
      await existente.save();
      return existente;
    }
  }

  // Alta nueva
  const alta = await UserGym.create({
    id_user,
    id_gym,
    start_date: hoy,
    finish_date: null,
    active: true,
    plan,
  });

  return alta;
};

const darBajaEnGimnasio = async ({ id_user, id_gym }) => {
  const relacion = await UserGym.findOne({
    where: { id_user, id_gym, active: true },
  });

  if (!relacion) {
    throw new Error('El usuario no tiene una membresía activa en ese gimnasio.');
  }

  relacion.active = false;
  relacion.finish_date = new Date();
  await relacion.save();

  return relacion;
};

const obtenerGimnasiosActivos = async (id_user) => {
  const activos = await UserGym.findAll({
    where: { id_user, active: true },
    include: {
      model: Gym,
      attributes: ['name', 'city', 'address'],
    },
  });

  return activos;
};

const obtenerHistorialGimnasiosPorUsuario = async (id_user, active) => {
  const filtros = { id_user };

  if (active !== undefined) {
    filtros.active = active === 'true';
  }

  return await UserGym.findAll({
    where: filtros,
    include: {
      model: Gym,
      attributes: ['name', 'city', 'address'],
    },
    order: [['start_date', 'DESC']],
  });
};

const obtenerHistorialUsuariosPorGimnasio = async (id_gym, active) => {
  const filtros = { id_gym };

  if (active !== undefined) {
    filtros.active = active === 'true';
  }

  return await UserGym.findAll({
    where: filtros,
    include: {
      model: User,
      attributes: ['name', 'lastname', 'email'],
    },
    order: [['start_date', 'DESC']],
  });
};

const contarUsuariosActivosEnGimnasio = async (id_gym) => {
  const total = await UserGym.count({
    where: {
      id_gym,
      active: true,
    },
  });

  return total;
};

module.exports = {
  darAltaEnGimnasio,
  darBajaEnGimnasio,
  obtenerGimnasiosActivos,
  obtenerHistorialGimnasiosPorUsuario,
  obtenerHistorialUsuariosPorGimnasio,
  contarUsuariosActivosEnGimnasio,
};
