var memoryCache = require('memory-cache');

var middlewareObj = {};

middlewareObj.cache = function (duration) {
    return function (req, res, next) {
        let key = '__express__' + req.originalUrl || req.url;
        let cachedBody = memoryCache.get(key);
        if (cachedBody) {
            return res.send(cachedBody);
        } else {
            res.sendResponse = res.send;
            res.send = function (body) {
                memoryCache.put(key, body, duration * 1000);
                res.sendResponse(body);
            }
            next();
        }
    }
}

module.exports = middlewareObj;