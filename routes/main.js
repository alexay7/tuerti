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
    if (eventInfo) {
        if (eventInfo.type == "birthday") {
            res.redirect("/");
        }
        var eventGuests = await getEventGuests(req.params.id);
        eventInfo.guests = eventGuests;
        res.render("home/event", { locals, eventInfo })
    } else {
        res.redirect("/");
    }
});

router.post("/event/:id/changenotifs", isLoggedIn, function(req, res) {
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

router.post("/event/:id/changeassist", isLoggedIn, function(req, res) {
    models.eventguest.findOne({
        where: {
            guestId: req.user.id,
            eventId: req.params.id
        }
    }).then(function(eventguest) {
        if (eventguest) {
            if (req.body.newassist == "no") {
                eventguest.destroy().then(function() {
                    res.redirect("back");
                });
            } else {
                eventguest.update({
                    promise: req.body.newassist
                }).then(function() {
                    res.redirect("back");
                });
            }
        } else {
            var newguest = {
                eventId: req.params.id,
                guestId: req.user.id,
                promise: req.body.newassist
            }
            models.eventguest.create(newguest).then(function() {
                res.redirect("back");
            });
        }

    });
});

router.post("/event/create", isLoggedIn, function(req, res) {
    var allday;
    if (req.body.allday == "on") {
        allday = true
    } else {
        allday = false
    }
    var newevent = {
        name: req.body.name,
        target: req.body.date,
        description: req.body.desc,
        place: req.body.place,
        direction: req.body.dir,
        phone: req.body.phone,
        webpage: req.body.web,
        privacy: req.body.privacy,
        allday,
        ownerId: req.user.id,
        type: "event"
    };
    models.event.create(newevent).then(function(event) {
        if (event) {
            var newguest = {
                eventId: event.id,
                guestId: req.user.id,
                promise: "yes"
            }
            models.eventguest.create(newguest).then(function() {
                res.redirect("/event/" + event.id);
            });
        } else {
            res.redirect("back");
        }
    })
});

router.get("/event/:id/delete", isLoggedIn, isEventOwner, function(req, res) {
    models.event.findByPk(req.params.id).then(function(event) {
        event.destroy().then(function() {
            res.redirect("/");
        });
    });
});

router.post("/event/:id/edit", isLoggedIn, isEventOwner, function(req, res) {
    //data validation
    var accepted = true;
    if (accepted) {
        var allday;
        if (req.body.newallday == "on") {
            allday = true
        } else {
            allday = false
        }
        models.event.findByPk(req.params.id).then(function(event) {
            event.update({
                name: req.body.newname,
                target: req.body.newdate,
                description: req.body.newdesc,
                place: req.body.newplace,
                direction: req.body.newdir,
                phone: req.body.newphone,
                webpage: req.body.newweb,
                privacy: req.body.newprivacy,
                allday
            });
        });
        res.redirect("back");
    }

});

async function isEventOwner(req, res, next) {
    var event = await getEventInfo(req.params.id);
    if (event.ownerId == req.user.id) {
        next();
    } else {
        res.redirect("back");
    }
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}

async function getEvents(id) {
    const Op = require('Sequelize').Op;
    return models.eventguest.findAll({
        where: {
            guestId: id,
            promise: {
                [Op.or]: ["yes", "maybe"]
            }
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

function getUserInfoMin(userId) {
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
            if (guestId) {
                eventData.dataValues.relation = await getEventRelation(eventId, guestId);
            }
            eventData.dataValues.owner = await getUserInfoMin(eventData.dataValues.ownerId);
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
            eventId
        }
    }).then(function(eventGuests) {
        var yes = 0,
            maybe = 0,
            und = 0;
        var users = []
        if (eventGuests.length != 0) {
            var bar = new Promise(function(resolve, reject) {
                eventGuests.forEach(async function(eventguest) {
                    var guestInfo = await getUserInfoMin(eventguest.guestId);
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

module.exports = router;