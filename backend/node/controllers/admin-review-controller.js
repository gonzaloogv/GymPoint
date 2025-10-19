
const adminReviewService = require('../services/admin-review-service');

const getAllReviews = async (req, res) => {
  try {
    const { limit, offset, is_approved, sortBy, order } = req.query;
    const options = {
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
      is_approved: is_approved !== undefined ? (is_approved === 'true') : undefined,
      sortBy: sortBy || 'created_at',
      order: order || 'DESC'
    };
    const result = await adminReviewService.getAllReviews(options);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const getReviewStats = async (req, res) => {
  try {
    const stats = await adminReviewService.getReviewStats();
    res.json(stats);
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
    res.json(review);
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
