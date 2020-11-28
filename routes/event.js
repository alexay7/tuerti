const express = require("express"),
    router = express.Router(),
    models = require('../app/models'),
    { isLoggedIn } = require("../middleware"),
    { getEventInfo, getEventGuests, isEventOwner } = require("../middleware/event");

router.get("/:id", isLoggedIn, async function(req, res) {
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

router.post("/:id/changenotifs", isLoggedIn, function(req, res) {
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

router.post("/:id/changeassist", isLoggedIn, function(req, res) {
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

router.post("/create", isLoggedIn, function(req, res) {
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

router.get("/:id/delete", isLoggedIn, isEventOwner, function(req, res) {
    models.event.findByPk(req.params.id).then(function(event) {
        event.destroy().then(function() {
            res.redirect("/");
        });
    });
});

router.post("/:id/edit", isLoggedIn, isEventOwner, function(req, res) {
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

module.exports = router;