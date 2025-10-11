const reviewService = require('../services/review-service');
const listarPorGym = async (req, res) => {
  try {
    const { id_gym } = req.params;
    const idGym = Number(id_gym);
    if (Number.isNaN(idGym)) {
      return res.status(400).json({ error: 'ID de gimnasio inválido' });
    }
    const { limit, offset } = req.query;
    const reviews = await reviewService.listarReviewsPorGym(idGym, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined
    });
    res.json(reviews);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const obtenerStats = async (req, res) => {
  try {
    const { id_gym } = req.params;
    const idGym = Number(id_gym);
    if (Number.isNaN(idGym)) {
      return res.status(400).json({ error: 'ID de gimnasio inválido' });
    }
    const stats = await reviewService.obtenerStatsPorGym(idGym);
    res.json(stats);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const crearReview = async (req, res) => {
  try {
    const userProfile = req.account?.userProfile;
    if (!userProfile) {
      return res.status(403).json({ error: 'Perfil de usuario requerido' });
    }
    const review = await reviewService.crearReview({
      ...req.body,
      id_user_profile: userProfile.id_user_profile
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const actualizarReview = async (req, res) => {
  try {
    const userProfile = req.account?.userProfile;
    const isAdmin = req.roles?.includes('ADMIN');
    const idReview = Number(req.params.id_review);
    if (Number.isNaN(idReview)) {
      return res.status(400).json({ error: 'ID de reseña inválido' });
    }
    const review = await reviewService.actualizarReview(
      idReview,
      req.body,
      {
        id_user_profile: userProfile?.id_user_profile,
        isAdmin
      }
    );
    res.json(review);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const eliminarReview = async (req, res) => {
  try {
    const userProfile = req.account?.userProfile;
    const isAdmin = req.roles?.includes('ADMIN');
    const idReview = Number(req.params.id_review);
    if (Number.isNaN(idReview)) {
      return res.status(400).json({ error: 'ID de reseña inválido' });
    }
    await reviewService.eliminarReview(idReview, {
      id_user_profile: userProfile?.id_user_profile,
      isAdmin
    });
    res.status(204).send();
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const marcarUtil = async (req, res) => {
  try {
    const userProfile = req.account?.userProfile;
    if (!userProfile) {
      return res.status(403).json({ error: 'Perfil de usuario requerido' });
    }
    const idReview = Number(req.params.id_review);
    if (Number.isNaN(idReview)) {
      return res.status(400).json({ error: 'ID de reseña inválido' });
    }
    const review = await reviewService.marcarReviewUtil(
      idReview,
      userProfile.id_user_profile
    );
    res.json(review);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const removerUtil = async (req, res) => {
  try {
    const userProfile = req.account?.userProfile;
    if (!userProfile) {
      return res.status(403).json({ error: 'Perfil de usuario requerido' });
    }
    const idReview = Number(req.params.id_review);
    if (Number.isNaN(idReview)) {
      return res.status(400).json({ error: 'ID de reseña inválido' });
    }
    const removed = await reviewService.removerReviewUtil(
      idReview,
      userProfile.id_user_profile
    );
    res.json({ removed });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
module.exports = {
  listarPorGym,
  obtenerStats,
  crearReview,
  actualizarReview,
  eliminarReview,
  marcarUtil,
  removerUtil
};