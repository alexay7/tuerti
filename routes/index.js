const express = require("express"),
    router = express.Router();

router.get("/about", function (req, res) {
    res.render("index/about", { locals });
});

router.get("/help", function (req, res) {
    res.render("index/help", { locals });
});

router.get("/legal", function (req, res) {
    res.render("index/legal", { locals });
});

router.get("/privacy", function (req, res) {
    res.render("index/privacy", { locals });
});

router.post("/changelang", function (req, res) {
    res.cookie("lang", req.body.lang);
    res.redirect("back");
});

module.exports = router;