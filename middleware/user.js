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

middlewareObj.addVisit = function(userId) {
    models.user.findByPk(userId).then(function(user) {
        var newvisits = user.visits + 1;
        user.update({
            visits: newvisits
        });
    })
}

middlewareObj.canViewPhoto = function(userId) {
    return false;
}

module.exports = middlewareObj;