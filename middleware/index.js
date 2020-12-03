var middlewareObj = {},
    models = require("../app/models");

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        middlewareObj.isAlive(req.user.id);
        next();
    } else {
        res.redirect('/');
    }
}

middlewareObj.isAlive = function (userId) {
    models.user.findByPk(userId).then(function (user) {
        if (user) {
            user.update({
                last_activity: new Date()
            })
        }
    });
}

middlewareObj.simplifyDate = function (date, format) {
    /*
    FORMATS

    "hoursminutesago", hace x horas y x minutos
    "hoursago", "hace x horas"


    */
    var today = new Date();
    var differenceDays = (today - date) / 86400000;
    var options = { day: 'numeric', month: 'short', year: "numeric" };
    var newdate = date.toLocaleDateString("en-US", options);

    if (differenceDays < 1) {
        var differenceHours = differenceDays * 24;
        if (differenceHours < 1) {
            if (differenceHours * 60 < 5) {
                return locals.rightnow;
            }
            return locals.hace + Math.floor(differenceHours * 60) + " " + locals.minutes + locals.ago
        } else {
            if (format == "hoursago") {
                return locals.hace + Math.floor(differenceHours) + " " + locals.hours + locals.ago;
            } else {
                var hours = Math.floor(differenceHours);
                var minutes = Math.floor(differenceHours * 60 - Math.floor(differenceHours) * 60);
                switch (minutes) {
                    case 0:
                        if (hours == 1) {
                            return locals.hace + hours + " " + locals.hour + locals.ago;
                        } else {
                            return locals.hace + hours + " " + locals.hours + locals.ago;
                        }
                    case 1:
                        if (hours == 1) {
                            return locals.hace + hours + " " + locals.hour + " " + minutes + " " + locals.minute + locals.ago;
                        } else {
                            return locals.hace + hours + " " + locals.hours + " " + locals.and + " " + minutes + " " + locals.minute + locals.ago;
                        }
                    default:
                        if (hours == 1) {
                            return locals.hace + hours + " " + locals.hour + " " + minutes + " " + locals.minutes + locals.ago;
                        } else {
                            return locals.hace + hours + " " + locals.hours + " " + minutes + " " + locals.minutes + locals.ago;
                        }
                }
            }
        }
    } else {
        return newdate;
    }
}

module.exports = middlewareObj;