const express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    models = require("../app/models"),
    { body, validationResult } = require('express-validator');


router.get("/register", isAlreadyIn, function(req, res) {
    res.render("index/register", { locals });
});

router.post('/register', isAlreadyIn, [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 5 }),
    body('name').escape().not().isEmpty().isLength({ min: 2 }),
    body('surnames').escape().not().isEmpty().isLength({ min: 2 }),
    body('birthday').isDate().not().isEmpty()
], function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash(errors);
        return res.redirect("back");
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