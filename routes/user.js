const express = require("express"),
    router = express.Router(),
    { isLoggedIn } = require("../middleware"),
    { getUserInfo, addVisit, canViewPhoto } = require("../middleware/user"),
    path = require('path');

router.get('/photos/:uid/:photoName', isLoggedIn, function(req, res) {
    if (canViewPhoto(req.user.id)) {
        res.sendFile(path.join(__dirname, '../') + '/private/photos/' + req.params.uid + "/" + req.params.photoName);
    }
});

router.get("/user/:id", isLoggedIn, async function(req, res) {
    var isOwner = false;
    var userInfo = await getUserInfo(req.params.id, req.user.id);

    if (userInfo) {
        if (userInfo.id == req.user.id) {
            isOwner = true;
        } else {
            addVisit(userInfo.id);
        }
        res.render("home/profile", { locals, userInfo, isOwner });
    } else {
        res.redirect("/");
    }
});


module.exports = router;