const express = require("express"),
    bodyParser = require('body-parser'),
    passport = require("passport"),
    session = require("express-session"),
    methodOverride = require("method-override"),
    Languages = require("./core/languajes"),
    cookieParser = require("cookie-parser"),
    flash = require('connect-flash'),
    app = express(),
    models = require("./app/models");

app.use(cookieParser());
app.use(flash());

require('./app/config/passport/passport.js')(passport, models.user);

function lang(req, res) {
    var language = getcookie(req, res);
    return locals = siteLanguage(language);
}

function getcookie(req, res) {
    var cookie = req.cookies["lang"];
    if (cookie == undefined) {
        res.cookie("lang", "es", { httpOnly: false });
        return "lang=es";
    } else {
        return cookie;
    }
}

function siteLanguage(language) {
    switch (language) {
        case "en":
            return Languages["english"];
        default:
            return Languages["spanish"];
    }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: process.env.PASSPORT_SECRET, resave: true, saveUninitialized: true })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

models.sequelize.sync().then(function() {
    console.log('Nice! Database looks fine')
}).catch(function(err) {
    console.log(err, "Something went wrong with the Database Update!")
});

app.use(function(req, res, next) {
    lang(req, res);
    res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
    res.locals.currentUser = req.user;
    res.locals.messages = req.flash();
    next();
});

const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const mainRoutes = require("./routes/main");
const eventRoutes = require("./routes/event");
const userRoutes = require("./routes/user");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", mainRoutes);
app.use("/event", eventRoutes);
app.use("/", userRoutes);
app.use("/photos", express.static(__dirname + '/private'));

app.get("*", function(req, res) {
    res.redirect("/");
});


app.listen(process.env.PORT, process.env.URL, function() {
    console.log("Started Tuerti on - " + process.env.URL + ":" + process.env.PORT);
});