const express = require("express"),
    router = express.Router(),
    { getEvents } = require("../middleware/event");

router.get("/", async function(req, res) {
    if (req.isAuthenticated()) {
        var events = await getEvents(req.user.id);
        res.render("home/index", { locals, events });
    } else {
        res.render("index/index", { locals });
    }
});



module.exports = router;