const express = require("express"),
    router = express.Router(),
    models = require('../app/models');

router.get("/", async function(req, res) {
    if (req.isAuthenticated()) {
        var events = await getEvents(req.user.id);
        res.render("home/index", { locals, events });
    } else {
        res.render("index/index", { locals });
    }
});

router.get("/event/:id", isLoggedIn, async function(req, res) {
    var eventInfo = await getEventInfo(req.params.id, req.user.id);
    var eventGuests = await getEventGuests(req.params.id);
    eventInfo.guests = eventGuests;
    if (eventInfo.type == "birthday") {
        res.redirect("/");
    }
    if (eventInfo) {
        res.render("home/event", { locals, eventInfo })
    } else {
        res.redirect("/");
    }
});

router.post("/changenotifs/:id", isLoggedIn, function(req, res) {
    models.eventguest.findOne({
        where: {
            guestId: req.user.id,
            eventId: req.params.id
        }
    }).then(function(eventguest) {
        eventguest.update({
            notifications: !eventguest.notifications
        });
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}

async function getEvents(id) {
    return models.eventguest.findAll({
        where: {
            guestId: id,
            status: "accepted"
        }
    }).then(async function(events) {
        if (events.length != 0) {
            var totalEvents = []
            var bar = new Promise(function(resolve, reject) {
                events.forEach(async event => {
                    result = await getEventInfo(event.dataValues.eventId, id);
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
                    var date = event.target;
                    if (((date - today) / 86400000) < 1) {
                        todayEvents.push(event);
                    } else if (((date - today) / 86400000) < 2) {
                        tomorrowEvents.push(event);
                    } else if (((date - today) / 86400000) < 7) {
                        sevenDaysEvents.push(event);
                    }
                    var locale;
                    switch (locals.language) {
                        case "es":
                            locale = "es-ES";
                            break;
                        default:
                            locale = "en-US";
                    }
                    var options = { day: 'numeric', month: 'short' };
                    var newdate = date.toLocaleDateString(locale, options);
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

function getGuestInfo(userId) {
    return models.user.findByPk(userId, { attributes: ['id', 'firstname', 'lastname', 'avatar'] }).then(function(user) {
        if (user) {
            return user.dataValues;
        } else {
            return undefined;
        }
    });
}

function getEventInfo(eventId, guestId) {
    return models.event.findByPk(eventId).then(async function(eventData) {
        if (eventData == undefined) {
            return undefined;
        } else {
            eventData.dataValues.relation = await getEventRelation(eventId, guestId);
            return eventData.dataValues;
        }
    });
}

function getEventRelation(eventId, guestId) {
    return models.eventguest.findOne({
        where: {
            eventId,
            guestId
        }
    }).then(function(eventrelation) {
        if (eventrelation) {
            return eventrelation.dataValues;
        } else {
            return undefined;
        }
    });
}

function getEventGuests(eventId) {
    return models.eventguest.findAll({
        where: {
            eventId,
            status: "accepted"
        }
    }).then(function(eventGuests) {
        var yes = 0,
            maybe = 0,
            und = 0;
        var users = []
        var bar = new Promise(function(resolve, reject) {
            eventGuests.forEach(async function(eventguest) {
                var guestInfo = await getGuestInfo(eventguest.guestId);
                users.push(guestInfo);
                switch (eventguest.dataValues.promise) {
                    case "yes":
                        yes = yes + 1;
                        break;
                    case "maybe":
                        maybe = maybe + 1;
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
    });
}

module.exports = router;