const express = require("express"),
    router = express.Router(),
    { getEvents } = require("../middleware/event"),
    { isAlive } = require("../middleware");

router.get("/", async function (req, res) {
    var errors = {},
        info = {};
    if (typeof res.locals.messages.error != 'undefined') {
        errors = res.locals.messages.error;
    }
    if (typeof res.locals.messages.info != 'undefined') {
        info = res.locals.messages.info;
    }
    if (req.isAuthenticated()) {
        var events = await getEvents(req.user.id);
        isAlive(req.user.id);
        res.render("home/index", { locals, events, errors, info });
    } else {
        res.render("index/index", { locals });
    }
});



module.exports = router;