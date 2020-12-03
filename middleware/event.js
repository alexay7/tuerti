const models = require('../app/models');

var middlewareObj = {};

middlewareObj.isEventOwner = async function (req, res, next) {
    var event = await middlewareObj.getEventInfo(req.params.id);
    if (event.ownerId == req.user.id) {
        next();
    } else {
        res.redirect("back");
    }
}

middlewareObj.getEvents = async function (id) {
    const Op = require('Sequelize').Op;
    return models.eventguest.findAll({
        where: {
            guestId: id,
            promise: {
                [Op.or]: ["yes", "maybe"]
            }
        }
    }).then(async function (events) {
        if (events.length != 0) {
            var totalEvents = []
            var bar = new Promise(function (resolve, reject) {
                events.forEach(async event => {
                    result = await middlewareObj.getEventInfo(event.dataValues.eventId, id);
                    totalEvents.push(result);
                    if (totalEvents.length >= events.length) { return resolve(); }
                });
            });

            return bar.then(() => {
                var today = new Date(),
                    todayEvents = [],
                    tomorrowEvents = [],
                    sevenDaysEvents = [];
                today.setHours(today.getHours() + 1);
                totalEvents.forEach(event => {
                    var date = event.target,
                        options = { day: 'numeric', month: 'short' },
                        newdate = date.toLocaleDateString("en-US", options),
                        eventsplit = event.target.toLocaleDateString("en-US").split(/[/]/),
                        date = new Date(Date.UTC(eventsplit[2], eventsplit[0] - 1, eventsplit[1])),
                        todaysplit = today.toLocaleDateString("en-US").split(/[/]/);
                    if (eventsplit[0] == todaysplit[0] && eventsplit[1] == todaysplit[1] && eventsplit[2] == todaysplit[2]) {
                        todayEvents.push(event);
                    } else if (((date - today) / 86400000) < 1 && ((date - today) / 86400000) > 0) {
                        tomorrowEvents.push(event);
                    } else if (((date - today) / 86400000) < 7 && ((date - today) / 86400000) > 0) {
                        sevenDaysEvents.push(event);
                    }
                    event.target = newdate;
                });

                splitEvents = { todayEvents, tomorrowEvents, sevenDaysEvents };
                return splitEvents;

            });
        } else {
            var todayEvents = [],
                tomorrowEvents = [],
                sevenDaysEvents = [];
            splitEvents = { todayEvents, tomorrowEvents, sevenDaysEvents };
            return splitEvents;
        }
    });
}

middlewareObj.getUserInfoMin = function (userId) {
    return models.user.findByPk(userId, { attributes: ['id', 'firstname', 'lastname', 'avatar', 'last_activity'] }).then(function (user) {
        if (user) {
            return user.dataValues;
        } else {
            return undefined;
        }
    });
}

middlewareObj.getEventInfo = function (eventId, guestId) {
    return models.event.findByPk(eventId).then(async function (eventData) {
        if (eventData == undefined) {
            return undefined;
        } else {
            if (guestId) {
                eventData.dataValues.relation = await middlewareObj.getEventRelation(eventId, guestId);
            }
            eventData.dataValues.owner = await middlewareObj.getUserInfoMin(eventData.dataValues.ownerId);
            return eventData.dataValues;
        }
    });
}

middlewareObj.getEventRelation = function (eventId, guestId) {
    return models.eventguest.findOne({
        where: {
            eventId,
            guestId
        }
    }).then(function (eventrelation) {
        if (eventrelation) {
            return eventrelation.dataValues;
        } else {
            return undefined;
        }
    });
}

middlewareObj.getEventGuests = function (eventId) {
    return models.eventguest.findAll({
        where: {
            eventId
        }
    }).then(function (eventGuests) {
        var yes = 0,
            maybe = 0,
            und = 0;
        var users = []
        if (eventGuests.length != 0) {
            var bar = new Promise(function (resolve, reject) {
                eventGuests.forEach(async function (eventguest) {
                    var guestInfo = await middlewareObj.getUserInfoMin(eventguest.guestId);
                    users.push(guestInfo);
                    switch (eventguest.dataValues.promise) {
                        case "yes":
                            yes = yes + 1;
                            break;
                        case "maybe":
                            maybe = maybe + 1;
                            break;
                        case "no":
                            break;
                        default:
                            und = und + 1;
                            break;

                    }
                    if (users.length >= eventGuests.length) { return resolve(); }
                });
            });
            return bar.then(() => {
                var stats = { yes, maybe, und };
                var guests = { stats, users }
                return guests;
            });
        } else {
            var stats = { yes, maybe, und };
            var guests = { stats, users }
            return guests;
        }

    });
}

module.exports = middlewareObj;