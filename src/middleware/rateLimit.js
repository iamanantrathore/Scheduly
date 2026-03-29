const rateLimit = require('express-rate-limit');

const mutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting if X-Forwarded-For is set but trust proxy is not configured
    return false;
  }
});

module.exports = {
  mutationLimiter,
};
