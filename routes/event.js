const express = require("express"),
    router = express.Router(),
    models = require('../app/models'),
    { isLoggedIn } = require("../middleware"),
    { getEventInfo, getEventGuests, isEventOwner } = require("../middleware/event"),
    { body, validationResult } = require('express-validator');

router.get("/:id", isLoggedIn, async function(req, res) {
    var errors = {},
        info = {};
    if (typeof res.locals.messages.error != 'undefined') {
        errors = res.locals.messages.error;
    }
    if (typeof res.locals.messages.info != 'undefined') {
        info = res.locals.messages.info;
    }
    var eventInfo = await getEventInfo(req.params.id, req.user.id);
    if (eventInfo) {
        if (eventInfo.type == "birthday") {
            res.redirect("/");
        }
        var eventGuests = await getEventGuests(req.params.id);
        eventInfo.guests = eventGuests;
        res.render("home/event", { locals, eventInfo, errors, info })
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

router.post("/create", isLoggedIn, [
    body('name').not().isEmpty().isLength({ min: 2, max: 100 }),
    body('desc').isLength({ max: 3001 }),
    body('place').not().isEmpty().isLength({ min: 3, max: 100 }),
    body('dir').not().isEmpty().isLength({ min: 3, max: 100 })
], function(req, res) {
    const errors = validationResult(req);
    var errorlist = [];
    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            errorlist.push(error.param);
        });
        req.flash('error', errorlist);
        req.flash('info', req.body);
        return res.redirect("back");
    }
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

router.post("/:id/editdesc", [
    body('newdesc').isLength({ max: 3001 })
], isLoggedIn, isEventOwner, function(req, res) {
    const errors = validationResult(req);
    var errorlist = [];
    if (!errors.isEmpty()) {
        req.flash('error', "onlydesc");
        return res.redirect("back");
    }
    models.event.findByPk(req.params.id).then(function(event) {
        event.update({
            description: req.body.newdesc
        });
    });
    res.redirect("back");
});

router.post("/:id/edit", [
    body('newname').not().isEmpty().isLength({ min: 2, max: 100 }),
    body('newdesc').isLength({ max: 3001 }),
    body('newplace').not().isEmpty().isLength({ min: 3, max: 100 }),
    body('newdir').not().isEmpty().isLength({ min: 3, max: 100 })
], isLoggedIn, isEventOwner, function(req, res) {
    const errors = validationResult(req);
    var errorlist = [];
    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            errorlist.push(error.param);
        });
        req.flash('error', errorlist);
        req.flash('info', req.body);
        return res.redirect("back");
    }
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

});

module.exports = router;