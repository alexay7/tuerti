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
        res.cookie("lang", "en", { httpOnly: false });
        return "lang=es";
    } else {
        return cookie;
    }
}

function siteLanguage(language) {
    switch (language) {
        case "es":
            return Languages["spanish"];
        default:
            return Languages["english"];
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
    res.locals.success = req.flash('success_messages');
    res.locals.error = req.flash('error');
    next();
});

const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const mainRoutes = require("./routes/main");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", mainRoutes);

app.get("*", function(req, res) {
    res.redirect("/");
});


app.listen(process.env.PORT, process.env.URL, function() {
    console.log("Started Tuerti on - " + process.env.URL + ":" + process.env.PORT);
});