const express = require("express"),
    router = express.Router(),
    { isLoggedIn } = require("../middleware"),
    { getUserInfo } = require("../middleware/user");

router.get("/:id", isLoggedIn, async function(req, res) {
    var userInfo = await getUserInfo(req.params.id, req.user.id);
    if (userInfo) {
        res.render("home/profile", { locals, userInfo })
    } else {
        res.redirect("/");
    }
});

module.exports = router;