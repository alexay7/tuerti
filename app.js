const express = require("express"),
    loaders = require('./loaders/index.js'),
    logger = require("./loaders/log.js");

async function startServer() {

    const app = express();

    await loaders({ expressApp: app });

    app.listen(process.env.PORT, process.env.URL, function (err) {
        if (err) {
            logger.error("Something went wrong. Reason: " + err);
            return;
        }
        logger.info("Started Tuerti on - " + process.env.URL + ":" + process.env.PORT);
    });
}

startServer();