const models = require('../../models');
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

middlewareObj.addVisit = function (userId, profileId) {
    models.uservisit.findOne({
        where: {
            visitedId: profileId,
            visitorId: userId
        }
    }).then(function (visit) {
        if (!visit) {
            var newvisit = {
                visitedId: profileId,
                visitorId: userId
            };
            models.uservisit.create(newvisit);
        }
    });
}

middlewareObj.cleanVisits = function () {
    models.uservisit.findAll().then(function (visits) {
        visits.forEach(async function (visit) {
            await models.user.findByPk(visit.visitedId).then(function (user) {
                user.update({
                    visits: user.visits + 1
                });
            });
            visit.destroy();
        });
    });
}

middlewareObj.addStatus = async function (userId, content) {
    var newStatus = {
        ownerId: userId,
        writerId: userId,
        content,
        type: "status"
    };
    await models.userwall.create(newStatus);
    models.user.findOne({
        where: {
            id: userId
        }
    }).then(function (user) {
        var statuschange = new Date();
        if (user) {
            user.update({
                status: content,
                status_change: statuschange
            });
        }
    });
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
    return false; //TODO
}

middlewareObj.getUserWall = async function (userId) {
    var wall = [];
    await models.userwall.findAll({
        where: {
            ownerId: userId
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(async function (walltotal) {
        walltotal.forEach(async function (element) {
            if (element.dataValues.type == "status") {
                element.dataValues.comments = [];
                wall.push(element.dataValues);
            } else if (element.dataValues.type == "post") {
                element.dataValues.owner = await getUserInfoMin(element.dataValues.writerId);
                wall.push(element.dataValues);
            }
        });
        for (var element of walltotal) {
            if (element.dataValues.type == "comment") {
                element.dataValues.owner = await getUserInfoMin(element.dataValues.writerId);
                console.log(element.dataValues.parentId);
                wall.find(x => x.id == element.parentId).comments.push(element.dataValues);
            } else if (element.dataValues.type == "response") {
                wall.find(id => element.parentId).response = element.dataValues;
            }
        }
    });
    return wall;
}

module.exports = middlewareObj;