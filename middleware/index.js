var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}

middlewareObj.simplifyDate = function (date, format) {
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
            return "hace " + Math.floor(differenceHours) + " horas y " + Math.floor(differenceHours * 60 - Math.floor(differenceHours) * 60) + " minutos";
        }
    } else {
        return newdate;
    }
}

module.exports = middlewareObj;