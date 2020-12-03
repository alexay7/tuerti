const express = require("express"),
    router = express.Router(),
    models = require('../app/models'),
    { isLoggedIn, simplifyDate } = require("../middleware"),
    { getUserInfo, addVisit, canViewPhoto, findRelation, isOwnProfile, getFriends } = require("../middleware/user"),
    path = require('path'),
    { body, validationResult } = require('express-validator');

router.get('/photos/:uid/:photoName', isLoggedIn, function (req, res) {
    if (!canViewPhoto(req.user.id)) {
        res.sendFile(path.join(__dirname, '../') + '/private/photos/' + req.params.uid + "/" + req.params.photoName);
    }
});

router.get("/user/:id", isLoggedIn, async function (req, res) {
    var isOwner = false;
    var userInfo = await getUserInfo(req.params.id, req.user.id);
    var profileRelation = await findRelation(req.user.id, req.params.id);
    var friends = await getFriends(req.user.id, req.params.id);
    if (userInfo) {
        if (profileRelation.status == "blocked") {
            res.render("home/noaccess", { locals });
        } else {
            userInfo.friends = friends;
            if (userInfo.id == req.user.id) {
                isOwner = true;
            } else {
                addVisit(userInfo.id);
            }
            res.render("home/profile", { locals, userInfo, isOwner, profileRelation, simplifyDate });
        }
    } else {
        res.redirect("back");
    }
});

router.post("/user/:id/changestatus", isLoggedIn, isOwnProfile, [
    body('newstatus').not().isEmpty().isLength({ min: 1, max: 140 }),
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect("back");
    }
    models.user.findOne({
        where: {
            id: req.user.id
        }
    }).then(function (user) {
        var statuschange = new Date();
        if (user) {
            user.update({
                status: req.body.newstatus,
                status_change: statuschange
            });
        }
        res.redirect("back");
    });
});

router.post("/user/:id/deletefriend", isLoggedIn, function (req, res) {
    const Op = require('Sequelize').Op;
    models.userrelation.findOne({
        where: {
            [Op.or]: [{ userOneId: req.params.id }, { userTwoId: req.params.id }],
            [Op.or]: [{ userOneId: req.user.id }, { userTwoId: req.user.id }],
            status: "friends"
        }
    }).then(function (relation) {
        if (relation) {
            relation.destroy();
        }
        res.redirect("back");
    });
});

router.post("/user/:id/block", isLoggedIn, function (req, res) {
    const Op = require('Sequelize').Op;
    models.userrelation.findOne({
        where: {
            [Op.or]: [{ userOneId: req.params.id }, { userTwoId: req.params.id }],
            [Op.or]: [{ userOneId: req.user.id }, { userTwoId: req.user.id }],
            status: "friends"
        }
    }).then(function (relation) {
        if (relation) {
            relation.update({
                status: "blocked"
            }).then(function () {
                res.redirect("back");
            });
        } else {
            var newRelation = {
                userOneId: req.user.id,
                userTwoId: req.params.id,
                status: "blocked"
            }
            models.userrelation.create(newRelation).then(function () {
                res.redirect("back");
            });
        }
    });
});

router.post("/user/:id/friendship", isLoggedIn, function (req, res) {
    const Op = require('Sequelize').Op;
    models.userrelation.findOne({
        where: {
            [Op.or]: [{ userOneId: req.params.id }, { userTwoId: req.params.id }],
            [Op.or]: [{ userOneId: req.user.id }, { userTwoId: req.user.id }],
            status: "pending"
        }
    }).then(function (relation) {
        if (relation) {
            if (req.body.petition == "confirm" && relation.userTwoId == req.user.id) {
                relation.update({
                    status: "friends"
                }).then(function () {
                    res.redirect("back");
                })
            } else {
                relation.destroy().then(function () {
                    res.redirect("back");
                });
            }
        } else {
            if (req.body.petition == "create") {
                var newRelation = {
                    userOneId: req.user.id,
                    userTwoId: req.params.id,
                    status: "pending"
                }
                models.userrelation.create(newRelation).then(function () {
                    res.redirect("back");
                });
            } else {
                res.redirect("back");
            }

        }
    });
});

module.exports = router;