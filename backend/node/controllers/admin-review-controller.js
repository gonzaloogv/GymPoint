
const adminReviewService = require('../services/admin-review-service');

const parseIntegerQuery = (value, { min = 0, defaultValue } = {}) => {
  if (value === undefined) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < min) {
    return defaultValue;
  }
  return parsed;
};

const getAllReviews = async (req, res) => {
  try {
    const { limit, offset, is_approved, sortBy, order, searchTerm } = req.query;
    const options = {
      limit: parseIntegerQuery(limit, { min: 1, defaultValue: 20 }),
      offset: parseIntegerQuery(offset, { min: 0, defaultValue: 0 }),
      is_approved: is_approved !== undefined ? is_approved === 'true' : undefined,
      sortBy: typeof sortBy === 'string' ? sortBy : undefined,
      order: typeof order === 'string' ? order : undefined,
      searchTerm: typeof searchTerm === 'string' ? searchTerm : undefined
    };

    const result = await adminReviewService.getAllReviews(options);
    res.json({
      message: 'Reviews obtenidas con éxito',
      data: result
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const getReviewStats = async (req, res) => {
  try {
    const stats = await adminReviewService.getReviewStats();
    res.json({
      message: 'Estadísticas de reviews obtenidas con éxito',
      data: stats
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const approveReview = async (req, res) => {
  try {
    const { id_review } = req.params;
    const { is_approved } = req.body;

    if (is_approved === undefined) {
      return res.status(400).json({ error: 'El campo is_approved es requerido' });
    }

    const review = await adminReviewService.approveReview(Number(id_review), is_approved);
    res.json({
      message: `Review ${is_approved ? 'aprobada' : 'rechazada'} correctamente`,
      data: review
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id_review } = req.params;
    await adminReviewService.deleteReview(Number(id_review));
    res.status(204).send();
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

module.exports = {
  getAllReviews,
  getReviewStats,
  approveReview,
  deleteReview
};
