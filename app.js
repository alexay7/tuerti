const express = require("express"),
    loaders = require('./loaders/index.js');

async function startServer() {

    const app = express();

    await loaders({ expressApp: app });

    app.listen(process.env.PORT, process.env.URL, function (err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("Started Tuerti on - " + process.env.URL + ":" + process.env.PORT);
    });
}

startServer();