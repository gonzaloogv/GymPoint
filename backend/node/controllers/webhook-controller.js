const paymentService = require('../services/payment-service');
const { asyncHandler } = require('../middlewares/error-handler');

const mercadopagoWebhook = asyncHandler(async (req, res) => {
  const result = await paymentService.processWebhook(req.body);
  res.json(result);
});

module.exports = {
  mercadopagoWebhook
};

