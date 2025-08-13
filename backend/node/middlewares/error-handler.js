module.exports = (err, req, res, _next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // Si viene de Zod/Joi u otro validador
  if (err.errors && Array.isArray(err.errors)) {
    return res.status(status).json({
      error: 'ValidationError',
      code,
      details: err.errors,
    });
  }

  // Si express-rate-limit pasó un objeto como "message"
  if (err.name === 'RateLimitError' || err.status === 429) {
    return res.status(429).json({
      error: typeof err.message === 'string' ? err.message : 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  }

  // Fallback general
  return res.status(status).json({
    error: typeof err.message === 'string' ? err.message : 'Unexpected error',
    code,
  });
};
