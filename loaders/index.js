const expressLoader = require('./express'),
    passport = require("passport"),
    models = require("../models"),
    passportConfig = require('../config/passport.js');

var init = async function ({ expressApp }) {
    passportConfig(passport, models.user);

    await expressLoader({ app: expressApp });
    console.log("Express Initialized");

    await models.sequelize.sync().then(function () {
        console.log('Nice! Database looks fine')
    }).catch(function (err) {
        console.log(err, "Something went wrong with the Database Update!")
    });
    console.log("Database Initialized");
};

module.exports = init;