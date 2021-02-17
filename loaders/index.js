const expressLoader = require('./express'),
    passport = require("passport"),
    models = require("../models"),
    passportConfig = require('../config/passport.js'),
    logger = require('../loaders/log'),
    { cleanVisits } = require("../api/middleware/user");

var init = async function ({ expressApp }) {
    logger.info("Starting Tuerti\n");
    passportConfig(passport, models.user);

    await expressLoader({ app: expressApp });
    logger.info("Express loaded successfully");

    await models.sequelize.sync().then(function () {
        logger.info("Database loaded successfully");
    }).catch(function (err) {
        logger.error("Something went wrong. Reason: " + err);
    });

    cleanVisits(); //this should be runned by a cron every hour
};

module.exports = init;