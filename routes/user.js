const express = require("express"),
    router = express.Router(),
    { isLoggedIn } = require("../middleware");

router.get("/:id", isLoggedIn, async function(req, res) {
    res.render("home/profile", { locals })
});

module.exports = router;