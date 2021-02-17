//load bcrypt
var bCrypt = require('bcrypt'),
    models = require("../models"),
    logger = require('../loaders/log');

module.exports = function (passport, user) {
    var User = user;

    var LocalStrategy = require('passport-local').Strategy;
    passport.serializeUser(function (user, done) {
        User.findByPk(user.id).then(function (user) {
            user.update({
                online: false
            });
        });
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findByPk(id).then(function (user) {
            if (user) {
                user.password = null;
                done(null, user.get());
            } else {
                done(user.errors, null);
            }
        });
    });
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function (req, email, password, done) {
        if (req.body.terms != "yes") {
            return done(null, false, {
                message: 'terms'
            });
        }
        var generateHash = function (password) {
            return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
        };
        if (req.body.password == req.body.passwordconfirm) {
            User.findOne({
                where: {
                    email: email
                }
            }).then(function (user) {
                if (user) {
                    return done(null, false, {
                        message: 'mail'
                    });
                } else {
                    var userPassword = generateHash(password);
                    var data = {
                        email: email,
                        password: userPassword,
                        firstname: req.body.name,
                        lastname: req.body.surnames,
                        gender: req.body.gender,
                        occupation: req.body.occupation,
                        city: req.body.city,
                        country: req.body.country,
                        birthday: req.body.birthday,
                        university: req.body.university
                    };
                    User.create(data).then(function (newUser, created) {
                        if (!newUser) {
                            return done(null, false);
                        }
                        if (newUser) {
                            var eventName = newUser.firstname + " " + newUser.lastname;
                            const birthDate = new Date(newUser.birthday);
                            birthDate.setFullYear(new Date().getFullYear());
                            var birthdayData = {
                                ownerId: newUser.id,
                                name: eventName,
                                target: birthDate,
                                description: "birthday",
                                type: "birthday"
                            };
                            models.event.create(birthdayData).then(function (newEvent, created) {
                                if (!newEvent) {
                                    return done(null, false);
                                }
                                var eventguestdata = {
                                    guestId: newUser.id,
                                    eventId: newEvent.id,
                                    promise: "yes",
                                    status: "accepted",
                                    notifications: 0
                                }
                                models.eventguest.create(eventguestdata).then(function (newGuest, created) {
                                    if (!newGuest) {
                                        return done(null, false);
                                    }
                                    newUser.password = "";
                                    return done(null, newUser);
                                });

                            });

                        }
                    });
                }

            });
        } else {
            return done(null, false, {
                message: 'password'
            });
        }
    }));

    passport.use('local-signin', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },

        function (req, email, password, done) {
            var User = user;
            var isValidPassword = function (userpass, password) {
                return bCrypt.compareSync(password, userpass);
            }
            User.findOne({
                where: {
                    email: email
                }
            }).then(function (user) {
                if (!user) {
                    return done(null, false, {
                        message: "mail"
                    });
                }
                if (!isValidPassword(user.password, password)) {
                    return done(null, false, {
                        message: "pass"
                    });
                }
                user.update({
                    online: true
                });
                var userinfo = user.get();
                return done(null, userinfo);
            }).catch(function (err) {
                logger.error("Something went wrong. Reason: " + err);
                return done(null, false, {
                    message: 'Something went wrong with your Signin'
                });
            });
        }
    ));
}