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
    var eventInfo = await getEventInfo(req.params.id);
    if (eventInfo.type == "birthday") {
        res.redirect("/");
    }
    if (eventInfo) {
        res.render("home/event", { locals, eventInfo })
    } else {
        res.redirect("/");
    }
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/");
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
                    result = await getEventInfo(event.dataValues.eventId);
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

function getEventInfo(eventId) {
    return models.event.findByPk(eventId).then(function(eventData) {
        if (eventData == undefined) {
            return undefined;
        } else {
            return eventData.dataValues;
        }
    });
}

module.exports = router;