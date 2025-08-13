const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    req.body = data;
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return next({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
        details: err.errors,
      });
    }
    next(err);
  }
};

module.exports = validate;
