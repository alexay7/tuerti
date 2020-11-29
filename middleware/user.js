const models = require('../app/models');

var middlewareObj = {};

middlewareObj.getUserInfo = function(userId) {
    return models.user.findByPk(userId, { attributes: { exclude: ['password'] } }).then(function(user) {
        if (user) {
            return user.dataValues;
        } else {
            return undefined;
        }
    });
}

module.exports = middlewareObj;