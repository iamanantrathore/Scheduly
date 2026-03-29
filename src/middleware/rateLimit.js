const rateLimit = require('express-rate-limit');

const mutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  mutationLimiter,
};
