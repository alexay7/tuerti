const models = require('../app/models');
const { getUserInfoMin } = require('./event');

var middlewareObj = {};

middlewareObj.getUserInfo = function (userId) {
    return models.user.findByPk(userId, { attributes: { exclude: ['password'] } }).then(function (user) {
        if (user) {
            return user.dataValues;
        } else {
            return undefined;
        }
    });
}

middlewareObj.getUserBlog = function (userId) {
    return models.userblog.findAll({
        where: {
            ownerId: userId
        }
    }).then(function (blog) {
        return blog;
    });
}

middlewareObj.getUserInfoMin = function (userId) {
    return models.user.findByPk(userId, { attributes: ['id', 'firstname', 'lastname', 'avatar', 'online'] }).then(function (user) {
        if (user) {
            return user.dataValues;
        } else {
            return undefined;
        }
    });
}

middlewareObj.addVisit = function (userId) {
    models.user.findByPk(userId).then(function (user) {
        var newvisits = user.visits + 1;
        user.update({
            visits: newvisits
        });
    })
}

middlewareObj.findRelation = function (userId, profileId) {
    const Op = require('Sequelize').Op;
    if (userId == profileId) {
        dataValues = {
            status: "none"
        };
        return dataValues;
    }
    return models.userrelation.findOne({
        where: {
            [Op.or]: [{ userOneId: userId }, { userTwoId: userId }],
            [Op.or]: [{ userOneId: profileId }, { userTwoId: profileId }]
        }
    }).then(function (relationFound) {
        if (relationFound) {
            return relationFound.dataValues;
        } else {
            dataValues = {
                status: "none"
            };
            return dataValues;
        }
    });
}

middlewareObj.isOwnProfile = function (req, res, next) {
    if (req.params.id == req.user.id) {
        next();
    } else {
        res.redirect("back");
    }
}

middlewareObj.getFriends = async function (userId, profileId) {
    const Op = require('Sequelize').Op;
    return models.userrelation.findAll({
        where: {
            [Op.or]: [{ userOneId: profileId }, { userTwoId: profileId }],
            status: "friends"
        }
    }).then(function (friends) {
        if (friends.length > 0) {
            var profileFriends = [];
            var bar = new Promise(function (resolve, reject) {
                friends.forEach(async function (friend) {
                    if (friend.dataValues.userOneId == profileId) {
                        var friendInfo = await getUserInfoMin(friend.dataValues.userTwoId);
                    } else {
                        var friendInfo = await getUserInfoMin(friend.dataValues.userOneId);
                    }
                    profileFriends.push(friendInfo);
                    if (profileFriends.length >= friends.length) { return resolve(); }
                });
            });
            return bar.then(() => {
                return models.userrelation.findAll({
                    where: {
                        [Op.or]: [{ userOneId: userId }, { userTwoId: userId }],
                        status: "friends"
                    }
                }).then(function (friends) {
                    var userFriends = [];
                    var ber = new Promise(function (resolve, reject) {
                        friends.forEach(async function (friend) {
                            if (friend.dataValues.userOneId == userId) {
                                var friendInfo = await getUserInfoMin(friend.dataValues.userTwoId);
                            } else {
                                var friendInfo = await getUserInfoMin(friend.dataValues.userOneId);
                            }
                            userFriends.push(friendInfo);
                            if (userFriends.length >= friends.length) { return resolve(); }
                        });

                    });
                    return ber.then(() => {
                        var commonFriends = profileFriends.filter(function (n) {
                            for (var i = 0; i < userFriends.length; i++) {
                                if (n2 => n.userOneId == n2.userOneId && n.userTwoId == n2.userTwoId) {
                                    return true;
                                }
                            }
                            return false;
                        });
                        return { commonFriends, profileFriends };
                    });
                });
            });
        } else {
            var commonFriends = undefined,
                profileFriends = undefined;
            return { commonFriends, profileFriends };;
        }
    });


}

middlewareObj.canViewPhoto = function (userId) {
    return false;
}


module.exports = middlewareObj;