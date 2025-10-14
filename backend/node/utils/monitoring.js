function requestTimer(options = {}) {
  const thresholdMs = Number(options.thresholdMs ?? process.env.SLOW_HTTP_MS ?? 300);
  return function timerMiddleware(req, res, next) {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      try {
        const end = process.hrtime.bigint();
        const ms = Number(end - start) / 1e6;
        res.setHeader('X-Response-Time', `${ms.toFixed(1)}ms`);
        if (ms >= thresholdMs) {
          // Log breve para prod
          console.log(`[HTTP ${res.statusCode}] ${req.method} ${req.originalUrl} - ${ms.toFixed(1)}ms`);
        }
      } catch (_) { /* ignore */ }
    });
    next();
  };
}

module.exports = {
  requestTimer
};

