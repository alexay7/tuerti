const express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    models = require("../app/models");
const { body, validationResult } = require('express-validator');


router.get("/register", isAlreadyIn, function(req, res) {
    res.render("index/register", { locals });
});

router.post('/register', isAlreadyIn, [
    // username must be an email
    body('email').isEmail(),
    // password must be at least 5 chars long
    body('password').isLength({ min: 5 })
], function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var error = errors.array()[0].param;
        return res.render("index/register", { locals, error });
    }
    passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    })(req, res);
});

router.post('/login', passport.authenticate('local-signin', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true
}));

router.get("/logout", isLoggedIn, function(req, res) {
    models.user.findByPk(req.user.id).then(function(user) {
        if (user) {
            user.update({
                online: false,
                last_login: new Date()
            });
            req.logout();
            res.redirect("back");
        } else {
            res.redirect("/");
        }
    });

});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/");
    }
}

function isAlreadyIn(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect("/");
    } else {
        return next();
    }
}

module.exports = router;