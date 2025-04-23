const apicache = require('apicache');
// Configure apicache with default 5 minute TTL
const cacheMiddleware = apicache.options({ defaultDuration: '5 minutes' }).middleware;

// Middleware to clear cache on mutations
const clearCache = (req, res, next) => {
  apicache.clear();
  next();
};

module.exports = { cacheMiddleware, clearCache };
