var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
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
                return "Ahora mismo";
            }
            return "hace " + Math.floor(differenceHours * 60) + " minutos"
        } else {
            if (format == "hoursago") {
                return "hace " + Math.floor(differenceHours) + " horas";
            } else {
                var hours = Math.floor(differenceHours);
                var minutes = Math.floor(differenceHours * 60 - Math.floor(differenceHours) * 60);
                switch (minutes) {
                    case 0:
                        if (hours == 1) {
                            return "hace " + hours + " hora";
                        } else {
                            return "hace " + hours + " horas";
                        }
                    case 1:
                        if (hours == 1) {
                            return "hace " + hours + " hora" + minutes + " minuto";
                        } else {
                            return "hace " + hours + " horas y " + minutes + " minuto";
                        }
                    default:
                        if (hours == 1) {
                            return "hace " + hours + " hora y " + minutes + " minutos";
                        } else {
                            return "hace " + hours + " horas y " + minutes + " minutos";
                        }
                }
            }
        }
    } else {
        return newdate;
    }
}

module.exports = middlewareObj;