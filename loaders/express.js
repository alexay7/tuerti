require('colors');
const bodyParser = require('body-parser'),
    express = require("express"),
    passport = require("passport"),
    session = require("express-session"),
    methodOverride = require("method-override"),
    cookieParser = require("cookie-parser"),
    csrf = require('csurf'),
    Languages = require("../config/languajes"),
    path = require('path'),
    flash = require('connect-flash');

module.exports = async function ({ app }) {
    const indexRoutes = require("../api/routes/index");
    const authRoutes = require("../api/routes/auth");
    const mainRoutes = require("../api/routes/main");
    const eventRoutes = require("../api/routes/event");
    const userRoutes = require("../api/routes/user");

    app.use(cookieParser());
    app.use(flash());

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(csrf({ cookie: true }));
    app.use(session({ secret: process.env.PASSPORT_SECRET, resave: true, saveUninitialized: true })); // session secret
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function (req, res, next) {
        lang(req, res);
        res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
        res.locals.currentUser = req.user;
        res.locals.messages = req.flash();
        res.locals.csrfToken = req.csrfToken();
        next();
    });

    app.set("view engine", "ejs");
    app.use(express.static(path.join(__dirname, '../') + "/public"));
    app.use(methodOverride("_method"));

    app.use("/", indexRoutes);
    app.use("/", authRoutes);
    app.use("/", mainRoutes);
    app.use("/event", eventRoutes);
    app.use("/", userRoutes);
    app.use("/photos", express.static(path.join(__dirname, '../') + '/private'));

    app.get("*", function (req, res) {
        res.redirect("/");
    });

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

    return app;
};